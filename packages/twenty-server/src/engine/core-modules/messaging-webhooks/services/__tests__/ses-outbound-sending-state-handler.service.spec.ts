import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { type EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { SesOutboundSendingStateHandlerService } from 'src/engine/core-modules/messaging-webhooks/services/ses-outbound-sending-state-handler.service';
import { type SesEventBridgeNotification } from 'src/engine/core-modules/messaging-webhooks/types/ses-event-bridge-notification.type';

describe('SesOutboundSendingStateHandlerService.handle', () => {
  const setUp = () => {
    const emailingDomainTenantStatusService = {
      setTenantStatusForWorkspace: jest.fn().mockResolvedValue(undefined),
    } as unknown as EmailingDomainTenantStatusService;
    const service = new SesOutboundSendingStateHandlerService(
      emailingDomainTenantStatusService,
    );

    return { service, emailingDomainTenantStatusService };
  };

  // SES emits `Sending Status Enabled|Disabled` against three resource scopes
  // (tenant / configuration-set / identity). The handler must mirror the
  // status onto the workspace's DB column regardless of which scope produced
  // the event, since every twenty-managed resource shares the same prefix.
  describe.each([
    {
      scope: 'tenant ARN with opaque tenant-id segment',
      arn: 'arn:aws:ses:us-east-1:123456789012:tenant/twenty-workspace-ws1/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    },
    {
      scope: 'configuration-set ARN',
      arn: 'arn:aws:ses:us-east-1:123456789012:configuration-set/twenty-workspace-ws1',
    },
    {
      scope: 'identity ARN',
      arn: 'arn:aws:ses:us-east-1:123456789012:identity/twenty-workspace-ws1',
    },
  ])('on a $scope', ({ arn }) => {
    it.each([
      {
        detailType: 'Sending Status Disabled' as const,
        expected: EmailingDomainTenantStatus.PAUSED,
      },
      {
        detailType: 'Sending Status Enabled' as const,
        expected: EmailingDomainTenantStatus.ACTIVE,
      },
    ])(
      'mirrors "$detailType" to tenantStatus=$expected',
      async ({ detailType, expected }) => {
        const { service, emailingDomainTenantStatusService } = setUp();

        const event: SesEventBridgeNotification = {
          source: 'aws.ses',
          'detail-type': detailType,
          resources: [arn],
        };

        await service.handle(event);

        expect(
          emailingDomainTenantStatusService.setTenantStatusForWorkspace,
        ).toHaveBeenCalledWith('ws1', expected);
      },
    );
  });

  // Security-critical: a foreign SES resource that lands on the shared SNS
  // topic must not be allowed to flip our tenantStatus column. The
  // workspaceId resolver returns null for any ARN that doesn't carry the
  // twenty-managed name prefix; the handler must noop in that case.
  it('does not update any workspace when the ARN does not carry the twenty-managed prefix', async () => {
    const { service, emailingDomainTenantStatusService } = setUp();

    await service.handle({
      source: 'aws.ses',
      'detail-type': 'Sending Status Disabled',
      resources: [
        'arn:aws:ses:us-east-1:123456789012:tenant/some-other-prefix/abc',
      ],
    });

    expect(
      emailingDomainTenantStatusService.setTenantStatusForWorkspace,
    ).not.toHaveBeenCalled();
  });
});
