import { useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { IconPlus } from '@tabler/icons-react';

import { GET_PEOPLE } from '@/people/queries';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/ui/button/components/Button';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { Avatar } from '@/users/components/Avatar';
import {
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';

const StyledDropdownMenu = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  padding: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(40)};
`;

const StyledButton = styled(Button)`
  &:focus {
    color: ${({ theme }) => theme.grayScale.gray40};
  }
`;

const StyledDropdownContainer = styled.div<{ isMobile: boolean }>`
  left: unset !important;
  right: ${({ isMobile }) => (isMobile ? '0' : 'unset')};
  top: 35px !important;
`;

const StyledContainer = styled.div`
  position: relative;
`;

export function AddPersonToCompany({ companyId }: { companyId: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [updatePerson] = useUpdateOnePersonMutation();
  const isMobile = useIsMobile();
  const { refs, floatingStyles } = useFloating({
    strategy: 'absolute',
    middleware: [offset(10), flip()],
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
  });

  useListenClickOutside({
    refs: [refs.floating],
    callback: () => {
      if (isDropdownOpen) setIsDropdownOpen(false);
    },
  });

  const { data: { people: peopleWithoutCompany } = { people: [] } } =
    useGetPeopleQuery({
      variables: {
        orderBy: [],
        where: {
          company: null,
        },
      },
    });

  const filteredPeople = useMemo(
    () =>
      peopleWithoutCompany.filter((person) =>
        person?.displayName.toLowerCase().includes(searchFilter.toLowerCase()),
      ) ?? [],
    [peopleWithoutCompany, searchFilter],
  );

  async function handlePeopleSelected(companyId: string, personId: string) {
    await updatePerson({
      variables: {
        where: {
          id: personId,
        },
        data: {
          company: { connect: { id: companyId } },
        },
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
  }

  return (
    <StyledContainer>
      <StyledButton
        icon={<IconPlus size={14} />}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
      />
      {isDropdownOpen && peopleWithoutCompany.length > 0 ? (
        <StyledDropdownContainer
          isMobile={isMobile}
          ref={refs.setFloating}
          style={floatingStyles}
        >
          <StyledDropdownMenu autoFocus>
            <DropdownMenuSearch
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
              {filteredPeople.map(({ displayName, id, avatarUrl }) => (
                <DropdownMenuItem
                  key={id}
                  onClick={() => {
                    handlePeopleSelected(companyId, id);
                  }}
                >
                  <Avatar
                    size="lg"
                    type="rounded"
                    placeholder={displayName}
                    avatarUrl={avatarUrl}
                  />
                  <p>{displayName}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuItemsContainer>
          </StyledDropdownMenu>
        </StyledDropdownContainer>
      ) : (
        ''
      )}
    </StyledContainer>
  );
}
