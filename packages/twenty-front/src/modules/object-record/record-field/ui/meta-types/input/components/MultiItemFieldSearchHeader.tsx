import { OverlayMenuListSearchRow } from '@/ui/layout/overlay/components/OverlayMenuListSearchRow';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiItemFieldSearchHeaderProps = {
  value: string;
  onChange: (value: string) => void;
};

export const MultiItemFieldSearchHeader = ({
  value,
  onChange,
}: MultiItemFieldSearchHeaderProps) => (
  <>
    <OverlayMenuListSearchRow
      value={value}
      onChange={(event) =>
        onChange(
          turnIntoEmptyStringIfWhitespacesOnly(event.currentTarget.value),
        )
      }
    />
    <OverlayMenuListSeparator />
  </>
);
