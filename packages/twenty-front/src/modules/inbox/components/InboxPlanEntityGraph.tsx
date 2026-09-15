import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItemRecord } from '~/generated/graphql';

const StyledGraph = styled.div`
  align-items: stretch;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow-x: auto;
`;

const StyledEntity = styled.div<{ isClickable: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 180px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:hover {
    background: ${({ isClickable }) =>
      isClickable
        ? themeCssVariables.background.transparent.lighter
        : themeCssVariables.background.primary};
  }
`;

const StyledEntityHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAvatar = styled.div<{ isSquare: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${({ isSquare }) =>
    isSquare
      ? themeCssVariables.border.radius.sm
      : themeCssVariables.border.radius.rounded};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledConnector = styled.div`
  align-items: center;
  align-self: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledLine = styled.div`
  background: ${themeCssVariables.border.color.medium};
  height: 1px;
  width: 20px;
`;

type InboxPlanEntityGraphProps = {
  records: InboxItemRecord[];
};

// The rows are already in the order they read in, each naming how it relates to
// the one before it, so the chain is the row order rather than a graph to walk.
// A row backed by a record opens beside the inbox rather than navigating away.
export const InboxPlanEntityGraph = ({
  records,
}: InboxPlanEntityGraphProps) => {
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  if (records.length === 0) {
    return null;
  }

  return (
    <StyledGraph>
      {records.map((record, index) => {
        const objectNameSingular = isDefined(record.objectMetadataId)
          ? objectMetadataItemsByIdMap.get(record.objectMetadataId)
              ?.nameSingular
          : undefined;
        const recordId = record.recordId;
        const isClickable =
          isDefined(recordId) && isDefined(objectNameSingular);
        // The relation belongs to the row that names it, so it is drawn before
        // that row rather than after the one it points back at.
        const relationLabel = index > 0 ? record.relationLabel : undefined;

        return (
          <Fragment key={record.id}>
            {isDefined(relationLabel) && (
              <StyledConnector>
                <StyledLine />
                {relationLabel}
                <StyledLine />
              </StyledConnector>
            )}
            <StyledEntity
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              isClickable={isClickable}
              onClick={
                isClickable
                  ? () =>
                      openRecordInSidePanel({ recordId, objectNameSingular })
                  : undefined
              }
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openRecordInSidePanel({ recordId, objectNameSingular });
                      }
                    }
                  : undefined
              }
            >
              <StyledEntityHeader>
                <StyledAvatar isSquare={!isDefined(record.subtitle)}>
                  {record.label.charAt(0).toUpperCase()}
                </StyledAvatar>
                {record.label}
              </StyledEntityHeader>
              {isDefined(record.subtitle) && (
                <StyledSubtitle>{record.subtitle}</StyledSubtitle>
              )}
            </StyledEntity>
          </Fragment>
        );
      })}
    </StyledGraph>
  );
};
