import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { flip, offset, shift, useFloating } from '@floating-ui/react';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import {
  PeoplePicker,
  PersonForSelect,
} from '@/people/components/PeoplePicker';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { IconPlus } from '@/ui/icon';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { TextInputSettings } from '@/ui/input/text/components/TextInputSettings';
import { InputHotkeyScope } from '@/ui/input/text/types/InputHotkeyScope';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  useInsertOnePersonMutation,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  position: static;
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

export const AddPersonToCompany = ({
  companyId,
  peopleIds,
}: {
  companyId: string;
  peopleIds?: string[];
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreationDropdownOpen, setIsCreationDropdownOpen] = useState(false);
  const [username, setUsername] = useState(defaultUsername);
  const [updatePerson] = useUpdateOnePersonMutation();
  const [insertOnePerson] = useInsertOnePersonMutation();
  const { refs, floatingStyles } = useFloating({
    open: isDropdownOpen,
    placement: 'right-start',
    middleware: [flip(), shift(), offset({ mainAxis: 30, crossAxis: 0 })],
  });
  // close inline creation dialog
  useListenClickOutside({
    refs: [refs.floating],
    callback: () => {
      if (isCreationDropdownOpen) setIsCreationDropdownOpen(false);
      if (isDropdownOpen) setIsDropdownOpen(false); // just for double check, it is handled in the SingleEntitySelect
    },
  });

  const hotkeyCloser = useCallback(() => {
    if (isCreationDropdownOpen) setIsCreationDropdownOpen(false);
    if (isDropdownOpen) setIsDropdownOpen(false);
  }, [isCreationDropdownOpen, setIsCreationDropdownOpen, isDropdownOpen]);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handlePersonSelected =
    (companyId: string) => async (newPerson: PersonForSelect | null) => {
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

  const handleClosePicker = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      goBackToPreviousHotkeyScope();
    }
  };

  const handleOpenPicker = () => {
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
  };

  const handleUsernameChange =
    (type: 'firstName' | 'lastName') =>
    (name: string): void =>
      setUsername((prevUserName) => ({ ...prevUserName, [type]: name }));

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
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
  };

  return (
    <RecoilScope>
      <StyledContainer ref={refs.setReference}>
        <LightIconButton
          Icon={IconPlus}
          onClick={handleOpenPicker}
          size="small"
          accent="tertiary"
        />

        {isDropdownOpen && (
          <div ref={refs.setFloating} style={floatingStyles}>
            {isCreationDropdownOpen ? (
              <StyledInputContainer>
                <HotkeyEffect
                  hotkey={{
                    key: Key.Escape,
                    scope: RelationPickerHotkeyScope.RelationPicker,
                  }}
                  onHotkeyTriggered={hotkeyCloser}
                />
                <HotkeyEffect // this could be deleted if it is needed to blur out first as it designed in TextInputSettings component
                  hotkey={{
                    key: Key.Escape,
                    scope: InputHotkeyScope.TextInput,
                  }}
                  onHotkeyTriggered={hotkeyCloser}
                />
                <TextInputSettings
                  onKeyDown={handleInputKeyDown}
                  value={username.firstName}
                  onChange={handleUsernameChange('firstName')}
                  placeholder="First Name"
                />
                <TextInputSettings
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
};
