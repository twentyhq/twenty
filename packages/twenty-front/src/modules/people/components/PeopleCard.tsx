import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Person } from '@/people/types/Person';
import { IconDotsVertical, IconLinkOff, IconTrash } from '@/ui/display/icon';
import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Avatar } from '@/users/components/Avatar';

export type PeopleCardProps = {
  person: Pick<Person, 'id' | 'avatarUrl' | 'name' | 'jobTitle'>;
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

export const PeopleCard = ({
  person,
  hasBottomBorder = true,
}: PeopleCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const { refs, floatingStyles } = useFloating({
    strategy: 'absolute',
    middleware: [offset(10), flip()],
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
  });

  useListenClickOutside({
    refs: [refs.floating],
    callback: () => {
      setIsOptionsOpen(false);
      if (isOptionsOpen) {
        setIsHovered(false);
      }
    },
  });

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isOptionsOpen) {
      setIsHovered(false);
    }
  };

  const handleToggleOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  const {
    findManyRecordsQuery,
    updateOneRecordMutation,
    deleteOneRecordMutation,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const [updatePerson] = useMutation(updateOneRecordMutation);
  const [deletePerson] = useMutation(deleteOneRecordMutation);

  const handleDetachPerson = async () => {
    await updatePerson({
      variables: {
        idToUpdate: person.id,
        input: {
          companyId: null,
        },
      },
      refetchQueries: [getOperationName(findManyRecordsQuery) ?? ''],
    });
  };

  const handleDeletePerson = () => {
    deletePerson({
      variables: {
        idToDelete: person.id,
      },
      refetchQueries: [getOperationName(findManyRecordsQuery) ?? ''],
    });
  };

  return (
    <StyledCard
      isHovered={isHovered}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/object/person/${person.id}`)}
      hasBottomBorder={hasBottomBorder}
    >
      <Avatar
        size="lg"
        type="rounded"
        placeholder={person.name.firstName + ' ' + person.name.lastName}
        avatarUrl={person.avatarUrl}
      />
      <StyledCardInfo>
        <StyledTitle>
          {person.name.firstName + ' ' + person.name.lastName}
        </StyledTitle>
        {person.jobTitle && <StyledJobTitle>{person.jobTitle}</StyledJobTitle>}
      </StyledCardInfo>
      {isHovered && (
        <div ref={refs.setReference}>
          <FloatingIconButton
            onClick={handleToggleOptions}
            size="small"
            Icon={IconDotsVertical}
          />
          {isOptionsOpen && (
            <DropdownMenu
              data-select-disable
              ref={refs.setFloating}
              style={floatingStyles}
            >
              <DropdownMenuItemsContainer>
                <MenuItem
                  onClick={handleDetachPerson}
                  LeftIcon={IconLinkOff}
                  text="Detach relation"
                />
                <MenuItem
                  onClick={handleDeletePerson}
                  LeftIcon={IconTrash}
                  text="Delete person"
                  accent="danger"
                />
              </DropdownMenuItemsContainer>
            </DropdownMenu>
          )}
        </div>
      )}
    </StyledCard>
  );
};
