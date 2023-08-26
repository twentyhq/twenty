import { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';
import { IconPlus } from '@tabler/icons-react';
import { v4 } from 'uuid';

import {
  PeoplePicker,
  PersonForSelect,
} from '@/people/components/PeoplePicker';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { TextInput } from '@/ui/input/text/components/TextInput';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  useInsertOnePersonMutation,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledInputContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  width: ${({ theme }) => theme.spacing(62.5)};
  & * input,
  * div {
    background-color: ${({ theme }) => theme.background.primary};
  }
`;

const defaultUsername = { firstName: '', lastName: '' };

export function AddPersonToCompany({
  companyId,
  peopleIds,
}: {
  companyId: string;
  peopleIds?: string[];
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreationDropdownOpen, setIsCreationDropdownOpen] = useState(false);
  const [username, setUsername] = useState(defaultUsername);
  const [updatePerson] = useUpdateOnePersonMutation();
  const [insertOnePerson] = useInsertOnePersonMutation();
  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    middleware: [flip(), offset({ mainAxis: -20, crossAxis: 25 })],
  });

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function handlePersonSelected(companyId: string) {
    return async (newPerson: PersonForSelect | null) => {
      if (newPerson) {
        await updatePerson({
          variables: {
            where: {
              id: newPerson.id,
            },
            data: {
              company: { connect: { id: companyId } },
            },
          },
          refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
        });
        handleClosePicker();
      }
    };
  }

  function handleClosePicker() {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      goBackToPreviousHotkeyScope();
    }
  }

  function handleOpenPicker() {
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
  }

  function handleUsernameChange(type: 'firstName' | 'lastName') {
    return (name: string): void =>
      setUsername((prevUserName) => ({ ...prevUserName, [type]: name }));
  }

  async function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || (!username.firstName && !username.lastName))
      return;
    const newPersonId = v4();
    await insertOnePerson({
      variables: {
        data: {
          company: { connect: { id: companyId } },
          id: newPersonId,
          ...username,
        },
      },
      refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
    });
    setIsCreationDropdownOpen(false);
    setUsername(defaultUsername);
  }

  return (
    <RecoilScope>
      <StyledContainer>
        <div ref={refs.setReference}>
          <LightIconButton
            icon={<IconPlus />}
            onClick={handleOpenPicker}
            size="small"
            accent="tertiary"
          />
        </div>

        {isDropdownOpen && (
          <div ref={refs.setFloating} style={floatingStyles}>
            {isCreationDropdownOpen ? (
              <StyledInputContainer>
                <TextInput
                  onKeyDown={handleInputKeyDown}
                  value={username.firstName}
                  onChange={handleUsernameChange('firstName')}
                  placeholder="First Name"
                />
                <TextInput
                  onKeyDown={handleInputKeyDown}
                  value={username.lastName}
                  onChange={handleUsernameChange('lastName')}
                  placeholder="Last Name"
                />
              </StyledInputContainer>
            ) : (
              <PeoplePicker
                personId={''}
                onSubmit={handlePersonSelected(companyId)}
                onCancel={handleClosePicker}
                onCreate={() => setIsCreationDropdownOpen(true)}
                excludePersonIds={peopleIds}
              />
            )}
          </div>
        )}
      </StyledContainer>
    </RecoilScope>
  );
}
