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
  IconSearch,
  IconTrash,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useRemoveAgentHandoffMutation } from '~/generated-metadata/graphql';
import { AgentHandoffDto } from '~/generated/graphql';

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

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRows = styled.div`
  padding-block: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoHandoffs = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
`;

type SettingsAgentHandoffTableProps = {
  agentId: string;
  handoffTargets: AgentHandoffDto[];
  onHandoffRemoved: () => void;
};

export const SettingsAgentHandoffTable = ({
  agentId,
  handoffTargets,
  onHandoffRemoved,
}: SettingsAgentHandoffTableProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [searchFilter, setSearchFilter] = useState('');
  const [handoffToDelete, setHandoffToDelete] = useState<string | undefined>();

  const [removeAgentHandoff] = useRemoveAgentHandoffMutation();

  const filteredHandoffTargets = !searchFilter
    ? handoffTargets
    : handoffTargets.filter((handoff) => {
        const searchTerm = searchFilter.toLowerCase();
        const label = handoff.toAgent.label?.toLowerCase() || '';
        const description = handoff.description?.toLowerCase() || '';

        return label.includes(searchTerm) || description.includes(searchTerm);
      });

  const handleRemoveHandoff = async () => {
    if (!handoffToDelete) {
      return;
    }

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
        <TextInput
          value={searchFilter}
          onChange={setSearchFilter}
          placeholder={t`Search handoffs...`}
          fullWidth
          LeftIcon={IconSearch}
          sizeVariant="lg"
        />
      </StyledSearchContainer>

      <StyledTable>
        <TableRow gridAutoColumns="2fr 2fr 1fr">
          <TableHeader>
            <Trans>Target Agent</Trans>
          </TableHeader>
          <TableHeader>
            <Trans>Description</Trans>
          </TableHeader>
          <TableHeader align={'right'} />
        </TableRow>
        <StyledTableRows>
          {filteredHandoffTargets.length > 0 ? (
            filteredHandoffTargets.map((handoff) => (
              <TableRow gridAutoColumns="2fr 2fr 1fr" key={handoff.id}>
                <TableCell>
                  <OverflowingTextWithTooltip text={handoff.toAgent.label} />
                </TableCell>

                <StyledTableCell>
                  <OverflowingTextWithTooltip
                    text={handoff.description || t`No description`}
                  />
                </StyledTableCell>
                <TableCell align={'right'}>
                  <StyledButtonContainer>
                    <IconButton
                      onClick={() => {
                        openModal(AGENT_HANDOFF_DELETION_MODAL_ID);
                        setHandoffToDelete(handoff.toAgent.id);
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
