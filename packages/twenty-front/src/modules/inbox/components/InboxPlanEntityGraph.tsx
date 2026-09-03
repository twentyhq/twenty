import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type InboxPlanContextEdge,
  type InboxPlanContextEntity,
} from '@/inbox/types/InboxPlanContext';

const StyledGraph = styled.div`
  align-items: stretch;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow-x: auto;
`;

const StyledEntity = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 180px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
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
  entities: InboxPlanContextEntity[];
  edges: InboxPlanContextEdge[];
};

// The entities in the order the producer gave them, with the relation between
// neighbours written on the line that joins them. Producers lay a plan's
// entities out as a chain, so a relation between non neighbours is not drawn.
export const InboxPlanEntityGraph = ({
  entities,
  edges,
}: InboxPlanEntityGraphProps) => {
  if (entities.length === 0) {
    return null;
  }

  const findEdgeLabel = (leftKey: string, rightKey: string) =>
    edges.find(
      (edge) =>
        (edge.from === leftKey && edge.to === rightKey) ||
        (edge.from === rightKey && edge.to === leftKey),
    )?.label;

  return (
    <StyledGraph>
      {entities.map((entity, index) => {
        const nextEntity = entities[index + 1];
        const edgeLabel = isDefined(nextEntity)
          ? findEdgeLabel(entity.key, nextEntity.key)
          : undefined;

        return (
          <Fragment key={entity.key}>
            <StyledEntity>
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
