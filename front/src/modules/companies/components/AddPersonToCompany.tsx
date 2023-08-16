import { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';
import { IconPlus } from '@tabler/icons-react';

import {
  PeoplePicker,
  PersonForSelect,
} from '@/people/components/PeoplePicker';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { ButtonSize } from '@/ui/button/components/Button';
import { IconButton } from '@/ui/button/components/IconButton';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdateOnePersonMutation } from '~/generated/graphql';

const StyledContainer = styled.div`
  position: relative;
`;

export function AddPersonToCompany({
  companyId,
  peopleIds,
}: {
  companyId: string;
  peopleIds?: string[];
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [updatePerson] = useUpdateOnePersonMutation();
  const { refs, floatingStyles } = useFloating({
    placement: 'right',
    middleware: [flip(), offset({ mainAxis: 10, crossAxis: 20 })],
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

  return (
    <RecoilScope>
      <StyledContainer>
        <div ref={refs.setReference}>
          <IconButton
            icon={<IconPlus size={14} />}
            onClick={handleOpenPicker}
            size={ButtonSize.Small}
            variant={'transparent'}
          />
        </div>

        {isDropdownOpen && (
          <div ref={refs.setFloating} style={floatingStyles}>
            <PeoplePicker
              personId={''}
              onSubmit={handlePersonSelected(companyId)}
              onCancel={handleClosePicker}
              excludePersonIds={peopleIds}
            />
          </div>
        )}
      </StyledContainer>
    </RecoilScope>
  );
}
