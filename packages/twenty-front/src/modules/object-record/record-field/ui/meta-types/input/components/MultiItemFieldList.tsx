import { MultiItemFieldSearchHeader } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSearchHeader';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { type ReactNode, type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';

type MultiItemFieldListProps = {
  ref: Ref<HTMLDivElement>;
  children?: ReactNode;
  hasItems: boolean;
  footerInput?: ReactNode;
  addButton?: ReactNode;
  shouldShowSearch: boolean;
  searchFilter: string;
  onSearchFilterChange: (searchFilter: string) => void;
};

export const MultiItemFieldList = ({
  ref,
  children,
  hasItems,
  footerInput,
  addButton,
  shouldShowSearch,
  searchFilter,
  onSearchFilterChange,
}: MultiItemFieldListProps) => {
  const hasFooterContent = isDefined(footerInput) || isDefined(addButton);

  return (
    <OverlayMenuList
      ref={ref}
      header={
        shouldShowSearch ? (
          <MultiItemFieldSearchHeader
            value={searchFilter}
            onChange={onSearchFilterChange}
          />
        ) : undefined
      }
      footer={
        <>
          {hasItems && hasFooterContent && <OverlayMenuListSeparator />}
          {footerInput}
          {addButton}
        </>
      }
    >
      {children}
    </OverlayMenuList>
  );
};
