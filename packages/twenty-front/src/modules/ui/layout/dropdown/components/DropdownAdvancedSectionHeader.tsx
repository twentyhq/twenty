import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { Trans } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/icon';

type DropdownAdvancedSectionHeaderProps = {
  onBack: () => void;
};

export const DropdownAdvancedSectionHeader = ({
  onBack,
}: DropdownAdvancedSectionHeaderProps) => (
  <DropdownMenuHeader
    StartComponent={
      <DropdownMenuHeaderLeftComponent
        onClick={onBack}
        Icon={IconChevronLeft}
      />
    }
  >
    <Trans>Advanced</Trans>
  </DropdownMenuHeader>
);
