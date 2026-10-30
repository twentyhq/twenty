import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPencil, IconTrash } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreAgentListContainer } from '@/object-core/agents/components/CoreAgentListContainer';
import { type CoreAgentListItem } from '@/object-core/agents/types/CoreAgentListItem';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';

const StyledEmptyMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  line-height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type CoreAgentListProps = {
  items: CoreAgentListItem[];
  emptyMessage: string;
};

export const CoreAgentList = ({ items, emptyMessage }: CoreAgentListProps) => (
  <CoreAgentListContainer>
    {items.length === 0 ? (
      <StyledEmptyMessage>{emptyMessage}</StyledEmptyMessage>
    ) : (
      items.map((item) => (
        <ListItem
          key={item.id}
          startIcon={<ListItemIconContainer>{item.icon}</ListItemIconContainer>}
          description={item.description}
          actionsPlacement="end"
          actions={
            (isDefined(item.edit) || isDefined(item.remove)) && (
              <>
                {isDefined(item.edit) && (
                  <LightIconButton
                    aria-label={item.edit.label}
                    onClick={item.edit.onClick}
                  >
                    <IconPencil />
                  </LightIconButton>
                )}
                {isDefined(item.remove) && (
                  <LightIconButton
                    aria-label={item.remove.label}
                    onClick={item.remove.onClick}
                  >
                    <IconTrash />
                  </LightIconButton>
                )}
              </>
            )
          }
        >
          {item.label}
        </ListItem>
      ))
    )}
  </CoreAgentListContainer>
);
