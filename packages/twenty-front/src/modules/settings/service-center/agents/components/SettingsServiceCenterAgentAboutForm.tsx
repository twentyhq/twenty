import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { useFindAllInboxes } from '@/settings/service-center/inboxes/hooks/useFindAllInboxes';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { IntegrationType } from '@/settings/service-center/types/IntegrationType';
import { Select } from '@/ui/input/components/Select';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, useIcons } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

import { z } from 'zod';

const agentMetadataFormSchema = z.object({
  id: z.string(),
  isAdmin: z.boolean(),
  memberId: z.string().min(1, 'Member ID is required'),
  sectorIds: z.array(z.string()).nonempty('At least one sector ID is required'),
  inboxesIds: z.array(z.string()).nonempty('At least one inbox ID is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export const SettingsServiceCenterAgentFormSchema =
  agentMetadataFormSchema.pick({
    isAdmin: true,
    memberId: true,
    sectorIds: true,
    inboxesIds: true,
    workspaceId: true,
  });

export type SettingsServiceCenterAgentFormSchemaValues = z.infer<
  typeof agentMetadataFormSchema
>;

type SettingsServiceCenterAgentAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeAgent?: Agent;
};

const StyledSection = styled(Section)`
  display: flex;
  gap: 4px;
`;

export const SettingsServiceCenterAgentAboutForm = ({
  disabled,
  activeAgent,
}: SettingsServiceCenterAgentAboutFormProps) => {
  const { control, reset } =
    useFormContext<SettingsServiceCenterAgentFormSchemaValues>();
  // const { t } = useTranslation();
  const { getIcon } = useIcons();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { sectors, refetch: refetchSectors } = useFindAllSectors();
  const { inboxes, refetch: refecthInboxes } = useFindAllInboxes();
  const { whatsappIntegrations = [] } = useFindAllWhatsappIntegrations();

  const Icon = getIcon('IconIdBadge2');

  const memberOptions = workspaceMembers
    ?.filter(
      (member) => member.agentId === '' || member.agentId === activeAgent?.id,
    )
    .map((workspaceMember) => {
      const label =
        workspaceMember.name.firstName.trim() !== '' ||
        workspaceMember.name.lastName.trim() !== ''
          ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`
          : 'Name not provided';

      return {
        label: label,
        value: workspaceMember.id,
        avatarUrl: workspaceMember.avatarUrl,
      };
    });

  const sectorsOptions =
    sectors?.map((sector) => ({
      Icon: getIcon(sector.icon),
      label: sector.name,
      value: sector.id,
    })) ?? [];

  const inboxesOptions =
    inboxes?.map((inbox) => {
      const isWhatsapp =
        inbox.integrationType.toLowerCase() === IntegrationType.WHATSAPP;
      const IconName = isWhatsapp ? 'IconBrandWhatsapp' : 'IconBrandMessenger';
      const integration = isWhatsapp
        ? whatsappIntegrations.find((w) => w.id === inbox.whatsappIntegrationId)
        : null;

      return {
        Icon: getIcon(IconName),
        label: integration?.name ?? `${inbox.integrationType} (${inbox.id})`,
        value: inbox.id,
      };
    }) ?? [];

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (activeAgent) {
      reset({
        id: activeAgent.id,
        isAdmin: activeAgent.isAdmin ?? false,
        memberId: activeAgent.memberId,
        sectorIds: activeAgent.sectors?.map((sector) => sector.id) ?? [],
        inboxesIds: activeAgent.inboxes?.map((inbox) => inbox.id) ?? [],
        workspaceId: activeAgent.workspace.id ?? '',
      });
    }
  }, [activeAgent, reset]);

  useEffect(() => {
    refetchSectors();
    refecthInboxes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSectors =
    activeAgent?.sectors?.map((sector) => sector.id) ?? [];
  const selectedInboxes = activeAgent?.inboxes?.map((inbox) => inbox.id) ?? [];

  return (
    <>
      <StyledSection>
        <Icon />
        <H2Title
          title={'Admin permissions'}
          adornment={
            <Controller
              control={control}
              name="isAdmin"
              render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} />
              )}
            />
          }
          description={
            'This agent will be able to view all the chats in the service center'
          }
        />
      </StyledSection>
      <Section>
        <Controller
          control={control}
          name="memberId"
          render={({ field }) => (
            <Select
              disabled={disabled}
              dropdownId="member"
              label={'Member'}
              options={[
                {
                  label: 'Choose a member',
                  value: '',
                },
                ...memberOptions,
              ]}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
      </Section>
      <Section>
        <Controller
          name="sectorIds"
          control={control}
          render={({ field: { onChange } }) => {
            return (
              <FormMultiSelectFieldInput
                label="Select Sectors"
                options={sectorsOptions}
                defaultValue={selectedSectors}
                onChange={onChange}
              />
            );
          }}
        />
      </Section>
      <Section>
        <Controller
          name="inboxesIds"
          control={control}
          render={({ field: { onChange } }) => (
            <FormMultiSelectFieldInput
              label="Select Inboxes"
              options={inboxesOptions}
              defaultValue={selectedInboxes}
              onChange={onChange}
            />
          )}
        />
      </Section>
    </>
  );
};
