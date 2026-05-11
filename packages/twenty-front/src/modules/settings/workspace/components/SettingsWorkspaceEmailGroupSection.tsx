import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';

import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { H2Title, IconMail, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const GRID_AUTO_COLUMNS = '1fr 1fr';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledClickableRow = styled.div`
  > * {
    &:hover {
      background-color: ${themeCssVariables.background.transparent.light};
      cursor: pointer;
    }
  }
`;

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledHandle = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledForwardingCell = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceEmailGroupSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { channels } = useMyMessageChannels();

  const emailGroupChannels = channels.filter(
    (channel) => channel.type === MessageChannelType.EMAIL_GROUP,
  );

  return (
    <Section>
      <H2Title
        title={t`Email Groups`}
        description={t`Workspace-level shared addresses that receive forwarded mail.`}
      />
      {emailGroupChannels.length > 0 && (
        <Table>
          <TableRow gridAutoColumns={GRID_AUTO_COLUMNS}>
            <TableHeader
              padding={`0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[2]}`}
            >
              <Trans>Source</Trans>
            </TableHeader>
            <TableHeader
              padding={`0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[2]}`}
            >
              <Trans>Forwarding address</Trans>
            </TableHeader>
          </TableRow>
          <StyledTableRows>
            {emailGroupChannels.map((channel) => {
              const sourceHandle =
                channel.connectedAccount?.handle ?? channel.handle;

              return (
                <StyledClickableRow key={channel.id}>
                  <TableRow
                    gridAutoColumns={GRID_AUTO_COLUMNS}
                    onClick={() =>
                      navigateSettings(SettingsPath.EmailGroupChannelDetail, {
                        messageChannelId: channel.id,
                      })
                    }
                  >
                    <TableCell>
                      <StyledNameCell>
                        <IconMail size={16} />
                        <StyledHandle>{sourceHandle}</StyledHandle>
                      </StyledNameCell>
                    </TableCell>
                    <TableCell>
                      <StyledForwardingCell>
                        {channel.handle}
                      </StyledForwardingCell>
                    </TableCell>
                  </TableRow>
                </StyledClickableRow>
              );
            })}
          </StyledTableRows>
        </Table>
      )}
      <StyledFooter>
        <Button
          Icon={IconPlus}
          title={t`Add email group`}
          variant="secondary"
          size="small"
          onClick={() => navigateSettings(SettingsPath.NewEmailGroupChannel)}
        />
      </StyledFooter>
    </Section>
  );
};
