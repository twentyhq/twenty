import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type InboxItemContextEdge,
  type InboxItemContextEntity,
} from '@/inbox/types/InboxItemContext';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

// An entity names a standard object by kind; a producer that knows the exact
// object says so explicitly.
const OBJECT_NAME_SINGULAR_BY_ENTITY_KIND: Partial<
  Record<InboxItemContextEntity['kind'], string>
> = {
  person: CoreObjectNameSingular.Person,
  company: CoreObjectNameSingular.Company,
  opportunity: CoreObjectNameSingular.Opportunity,
};

type InboxPlanEntityGraphProps = {
  entities: InboxItemContextEntity[];
  edges: InboxItemContextEdge[];
};

// Producers lay a plan's entities out as a chain, so only the relation between
// neighbours is drawn. An entity backed by a record opens beside the inbox
// rather than navigating away from it.
export const InboxPlanEntityGraph = ({
  entities,
  edges,
}: InboxPlanEntityGraphProps) => {
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  if (entities.length === 0) {
    return null;
  }

  const findEdgeLabel = (leftKey: string, rightKey: string) =>
    edges.find(
      (edge) =>
        (edge.from === leftKey && edge.to === rightKey) ||
        (edge.from === rightKey && edge.to === leftKey),
    )?.label;

  const getObjectNameSingular = (entity: InboxItemContextEntity) =>
    isDefined(entity.objectMetadataId)
      ? objectMetadataItemsByIdMap.get(entity.objectMetadataId)?.nameSingular
      : OBJECT_NAME_SINGULAR_BY_ENTITY_KIND[entity.kind];

  return (
    <StyledGraph>
      {entities.map((entity, index) => {
        const nextEntity = entities[index + 1];
        const edgeLabel = isDefined(nextEntity)
          ? findEdgeLabel(entity.key, nextEntity.key)
          : undefined;
        const objectNameSingular = getObjectNameSingular(entity);
        const recordId = entity.recordId;
        const isClickable =
          isDefined(recordId) && isDefined(objectNameSingular);

        return (
          <Fragment key={entity.key}>
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
                <StyledAvatar isSquare={entity.kind !== 'person'}>
                  {entity.label.charAt(0).toUpperCase()}
                </StyledAvatar>
                {entity.label}
              </StyledEntityHeader>
              {isDefined(entity.subtitle) && (
                <StyledSubtitle>{entity.subtitle}</StyledSubtitle>
              )}
            </StyledEntity>
            {isDefined(edgeLabel) && (
              <StyledConnector>
                <StyledLine />
                {edgeLabel}
                <StyledLine />
              </StyledConnector>
            )}
          </Fragment>
        );
      })}
    </StyledGraph>
  );
};
