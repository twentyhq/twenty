import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
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
import { IconChevronLeft, IconEyeOff } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const ObjectOptionsDropdownFieldsContent = () => {
  const { t } = useLingui();
  const [searchInput, setSearchInput] = useState('');

  const { onContentChange, resetContent } = useObjectOptionsDropdown();

  return (
    <LegacyDropdownContent>
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
            <ListItem
              onClick={() => onContentChange('hiddenFields')}
              startIcon={<IconEyeOff />}
              render={<button type="button" />}
              hasSubmenu
            >{t`Hidden Fields`}</ListItem>
          </DropdownMenuItemsContainer>
        </>
      )}
    </LegacyDropdownContent>
  );
};
