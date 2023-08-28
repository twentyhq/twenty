import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { IconDotsVertical, IconLinkOff, IconTrash } from '@tabler/icons-react';

import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Avatar } from '@/users/components/Avatar';
import {
  Person,
  useDeleteManyPersonMutation,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';

import { GET_PEOPLE } from '../graphql/queries/getPeople';

export type PeopleCardProps = {
  person: Pick<Person, 'id' | 'avatarUrl' | 'displayName' | 'jobTitle'>;
  hasBottomBorder?: boolean;
};

const StyledCard = styled.div<{
  isHovered: boolean;
  hasBottomBorder?: boolean;
}>`
  align-items: center;
  align-self: stretch;
  background: ${({ theme, isHovered }) =>
    isHovered ? theme.background.tertiary : 'auto'};
  border-bottom: 1px solid
    ${({ theme, hasBottomBorder }) =>
      hasBottomBorder ? theme.border.color.light : 'transparent'};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(3)};
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    cursor: pointer;
  }
`;

const StyledCardInfo = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

const StyledJobTitle = styled.div`
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
  padding-left: ${({ theme }) => theme.spacing(0)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(0.5)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledRemoveOption = styled.div`
  color: ${({ theme }) => theme.color.red};
`;

export function PeopleCard({
  person,
  hasBottomBorder = true,
}: PeopleCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [updatePerson] = useUpdateOnePersonMutation();
  const [deletePerson] = useDeleteManyPersonMutation();

  const { refs, floatingStyles } = useFloating({
    strategy: 'absolute',
    middleware: [offset(10), flip()],
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
  });

  const theme = useTheme();

  useListenClickOutside({
    refs: [refs.floating],
    callback: () => {
      setIsOptionsOpen(false);
      if (isOptionsOpen) {
        setIsHovered(false);
      }
    },
  });

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    if (!isOptionsOpen) {
      setIsHovered(false);
    }
  }

  function handleToggleOptions(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  }

  function handleDetachPerson() {
    updatePerson({
      variables: {
        where: {
          id: person.id,
        },
        data: {
          company: {
            disconnect: true,
          },
        },
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
  }

  function handleDeletePerson() {
    deletePerson({
      variables: {
        ids: person.id,
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
  }

  return (
    <StyledCard
      isHovered={isHovered}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/person/${person.id}`)}
      hasBottomBorder={hasBottomBorder}
    >
      <Avatar
        size="lg"
        type="rounded"
        placeholder={person.displayName}
        avatarUrl={person.avatarUrl}
      />
      <StyledCardInfo>
        <StyledTitle>{person.displayName}</StyledTitle>
        {person.jobTitle && <StyledJobTitle>{person.jobTitle}</StyledJobTitle>}
      </StyledCardInfo>
      {isHovered && (
        <div ref={refs.setReference}>
          <FloatingIconButton
            onClick={handleToggleOptions}
            size="small"
            icon={<IconDotsVertical />}
          />
          {isOptionsOpen && (
            <StyledDropdownMenu ref={refs.setFloating} style={floatingStyles}>
              <StyledDropdownMenuItemsContainer
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuSelectableItem onClick={handleDetachPerson}>
                  <IconLinkOff size={14} />
                  Detach relation
                </DropdownMenuSelectableItem>
                <DropdownMenuSelectableItem onClick={handleDeletePerson}>
                  <IconTrash size={14} color={theme.font.color.danger} />
                  <StyledRemoveOption>Delete person</StyledRemoveOption>
                </DropdownMenuSelectableItem>
              </StyledDropdownMenuItemsContainer>
            </StyledDropdownMenu>
          )}
        </div>
      )}
    </StyledCard>
  );
}
