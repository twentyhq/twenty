import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFieldsSearchDropdownSection } from '@/views/components/ViewFieldsSearchDropdownSection';
import { ViewFieldsVisibleDropdownSection } from '@/views/components/ViewFieldsVisibleDropdownSection';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconChevronLeft, IconEyeOff } from 'twenty-ui/display';
import { MenuItemNavigate } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownFieldsContent = () => {
  const { t } = useLingui();
  const [searchInput, setSearchInput] = useState('');

  const { onContentChange, resetContent } = useObjectOptionsDropdown();

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Fields`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      {isNonEmptyString(searchInput) ? (
        <ViewFieldsSearchDropdownSection searchInput={searchInput} />
      ) : (
        <>
          <ViewFieldsVisibleDropdownSection />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <MenuItemNavigate
              onClick={() => onContentChange('hiddenFields')}
              LeftIcon={IconEyeOff}
              text={t`Hidden Fields`}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
