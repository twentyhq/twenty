import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  AppTooltip,
  IconSearch,
  IconTrash,
  TooltipDelay,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useRemoveAgentHandoffMutation } from '~/generated-metadata/graphql';

const AGENT_HANDOFF_DELETION_MODAL_ID = 'agent-handoff-deletion-modal';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(TextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoHandoffs = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

interface AgentHandoff {
  id: string;
  label: string;
  description?: string | null;
  // TODO: This should be the handoff description, not the agent description
  // The current GraphQL query only returns agent data, not handoff data
  // Need to implement findAgentHandoffs query to get handoff descriptions
}

interface SettingsAgentHandoffTableProps {
  agentId: string;
  handoffTargets: AgentHandoff[];
  onHandoffRemoved: () => void;
}

export const SettingsAgentHandoffTable = ({
  agentId,
  handoffTargets,
  onHandoffRemoved,
}: SettingsAgentHandoffTableProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const theme = useTheme();

  const [searchFilter, setSearchFilter] = useState('');
  const [handoffToDelete, setHandoffToDelete] = useState<string | undefined>();

  const [removeAgentHandoff] = useRemoveAgentHandoffMutation();

  const filteredHandoffTargets = !searchFilter
    ? handoffTargets
    : handoffTargets.filter((target) => {
        const searchTerm = searchFilter.toLowerCase();
        const label = target.label?.toLowerCase() || '';
        const description = target.description?.toLowerCase() || '';

        return label.includes(searchTerm) || description.includes(searchTerm);
      });

  const handleRemoveHandoff = async () => {
    if (!handoffToDelete) return;

    try {
      await removeAgentHandoff({
        variables: {
          input: {
            fromAgentId: agentId,
            toAgentId: handoffToDelete,
          },
        },
      });

      onHandoffRemoved();
      enqueueSuccessSnackBar({
        message: t`Handoff removed successfully`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Failed to remove handoff`,
      });
    }
  };

  const { openModal } = useModal();

  return (
    <>
      <StyledSearchContainer>
        <StyledSearchInput
          instanceId="agent-handoffs-search"
          value={searchFilter}
          onChange={setSearchFilter}
          placeholder={t`Search handoffs...`}
          fullWidth
          LeftIcon={IconSearch}
          sizeVariant="lg"
        />
      </StyledSearchContainer>

      <StyledTable>
        <TableRow
          gridAutoColumns="150px 1fr 1fr"
          mobileGridAutoColumns="100px 1fr 1fr"
        >
          <TableHeader>
            <Trans>Target Agent</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Description</Trans>
          </TableHeader>
          <TableHeader align={'right'}></TableHeader>
        </TableRow>
        <StyledTableRows>
          {filteredHandoffTargets.length > 0 ? (
            filteredHandoffTargets.map((targetAgent) => (
              <TableRow
                gridAutoColumns="150px 1fr 1fr"
                mobileGridAutoColumns="100px 1fr 1fr"
                key={targetAgent.id}
              >
                <TableCell>
                  <StyledTextContainerWithEllipsis
                    id={`handoff-agent-${targetAgent.id}`}
                  >
                    {targetAgent.label}
                  </StyledTextContainerWithEllipsis>
                  <AppTooltip
                    anchorSelect={`#handoff-agent-${targetAgent.id}`}
                    content={targetAgent.label}
                    noArrow
                    place="top"
                    positionStrategy="fixed"
                    delay={TooltipDelay.shortDelay}
                  />
                </TableCell>
                <TableCell>
                  <StyledTextContainerWithEllipsis>
                    {/* TODO: This should show the handoff description, not the agent description */}
                    {t`Handoff description not available yet`}
                  </StyledTextContainerWithEllipsis>
                </TableCell>
                <TableCell align={'right'}>
                  <StyledButtonContainer>
                    <IconButton
                      onClick={() => {
                        openModal(AGENT_HANDOFF_DELETION_MODAL_ID);
                        setHandoffToDelete(targetAgent.id);
                      }}
                      variant="tertiary"
                      size="medium"
                      Icon={IconTrash}
                    />
                  </StyledButtonContainer>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <StyledNoHandoffs>
              {!searchFilter
                ? t`No handoffs configured for this agent`
                : t`No handoffs match your search`}
            </StyledNoHandoffs>
          )}
        </StyledTableRows>
      </StyledTable>

      <ConfirmationModal
        modalId={AGENT_HANDOFF_DELETION_MODAL_ID}
        title={t`Remove Handoff`}
        subtitle={
          <Trans>
            This action cannot be undone. This will permanently remove the
            handoff configuration.
          </Trans>
        }
        onConfirmClick={handleRemoveHandoff}
        confirmButtonText={t`Remove handoff`}
      />
    </>
  );
};
