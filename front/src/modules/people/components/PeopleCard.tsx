import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { IconDotsVertical, IconLinkOff, IconTrash } from '@tabler/icons-react';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
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
  color: ${({ theme }) => theme.font.color.secondary};
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
          <IconButton
            onClick={handleToggleOptions}
            variant="shadow"
            size="small"
            icon={<IconDotsVertical size={theme.icon.size.md} />}
          />
          {isOptionsOpen && (
            <DropdownMenu ref={refs.setFloating} style={floatingStyles}>
              <DropdownMenuItemsContainer onClick={(e) => e.stopPropagation()}>
                <DropdownMenuSelectableItem onClick={handleDetachPerson}>
                  <IconButton icon={<IconLinkOff size={14} />} size="small" />
                  Detach relation
                </DropdownMenuSelectableItem>
                <DropdownMenuSelectableItem onClick={handleDeletePerson}>
                  <IconButton
                    icon={<IconTrash size={14} />}
                    size="small"
                    textColor="danger"
                  />
                  <StyledRemoveOption>Delete person</StyledRemoveOption>
                </DropdownMenuSelectableItem>
              </DropdownMenuItemsContainer>
            </DropdownMenu>
          )}
        </div>
      )}
    </StyledCard>
  );
}
