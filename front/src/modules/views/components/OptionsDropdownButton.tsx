import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import DropdownButton from '@/ui/filter-n-sort/components/DropdownButton';
import { FiltersHotkeyScope } from '@/ui/filter-n-sort/types/FiltersHotkeyScope';
import { IconChevronLeft, IconMinus, IconPlus, IconTag } from '@/ui/icon';
import {
  hiddenViewFieldsState,
  visibleViewFieldsState,
} from '@/ui/table/states/viewFieldsState';
import { useUpdateViewFieldMutation } from '~/generated/graphql';

import { GET_VIEW_FIELDS } from '../queries/select';

import { OptionsDropdownSection } from './OptionsDropdownSection';

type OptionsDropdownButtonProps = {
  HotkeyScope: FiltersHotkeyScope;
};

enum Option {
  Properties = 'Properties',
}

export const OptionsDropdownButton = ({
  HotkeyScope,
}: OptionsDropdownButtonProps) => {
  const theme = useTheme();
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    undefined,
  );

  const visibleFields = useRecoilValue(visibleViewFieldsState);
  const hiddenFields = useRecoilValue(hiddenViewFieldsState);

  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  const handleViewFieldVisibilityChange = useCallback(
    (viewFieldId: string, nextIsVisible: boolean) => {
      updateViewFieldMutation({
        variables: {
          data: { isVisible: nextIsVisible },
          where: { id: viewFieldId },
        },
        refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
      });
    },
    [updateViewFieldMutation],
  );

  const renderFieldActions = useCallback(
    (viewField: ViewFieldDefinition<ViewFieldMetadata>) =>
      // Do not allow hiding last visible column
      !viewField.isVisible || visibleFields.length > 1 ? (
        <IconButton
          icon={
            viewField.isVisible ? (
              <IconMinus size={theme.icon.size.sm} />
            ) : (
              <IconPlus size={theme.icon.size.sm} />
            )
          }
          onClick={() =>
            handleViewFieldVisibilityChange(viewField.id, !viewField.isVisible)
          }
        />
      ) : undefined,
    [handleViewFieldVisibilityChange, theme.icon.size.sm, visibleFields.length],
  );

  const resetSelectedOption = useCallback(() => {
    setSelectedOption(undefined);
  }, []);

  return (
    <DropdownButton
      label="Options"
      isActive={false}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={setIsUnfolded}
      HotkeyScope={HotkeyScope}
    >
      {!selectedOption && (
        <>
          <DropdownMenuHeader>View settings</DropdownMenuHeader>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <DropdownMenuItem
              onClick={() => setSelectedOption(Option.Properties)}
            >
              <IconTag size={theme.icon.size.md} />
              Properties
            </DropdownMenuItem>
          </DropdownMenuItemsContainer>
        </>
      )}
      {selectedOption === Option.Properties && (
        <>
          <DropdownMenuHeader
            startIcon={<IconChevronLeft size={theme.icon.size.md} />}
            onClick={resetSelectedOption}
          >
            Properties
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <OptionsDropdownSection
            renderActions={renderFieldActions}
            title="Visible"
            viewFields={visibleFields}
          />
          {hiddenFields.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <OptionsDropdownSection
                renderActions={renderFieldActions}
                title="Hidden"
                viewFields={hiddenFields}
              />
            </>
          )}
        </>
      )}
    </DropdownButton>
  );
};
