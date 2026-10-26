import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';

import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type MultipleRecordPickerPlacementStoryProps = {
  componentInstanceId: string;
};

export const MultipleRecordPickerPlacementStory = ({
  componentInstanceId,
}: MultipleRecordPickerPlacementStoryProps) => (
  <div
    role="region"
    aria-label="Scrollable record editor"
    style={{
      position: 'fixed',
      top: 32,
      left: 32,
      height: 'calc(100vh - 64px)',
      width: 400,
      overflowY: 'auto',
    }}
  >
    <div
      style={{
        boxSizing: 'content-box',
        minHeight: '100vh',
        paddingTop: 'calc(100vh - 160px)',
      }}
    >
      <DropdownRoot dropdownId={componentInstanceId} type="picker" multiple>
        <Dropdown.Trigger render={<Button>Link records</Button>} />
        <DropdownContent
          side="bottom"
          align="start"
          width={GenericDropdownContentWidth.ExtraLarge}
          aria-label="Related records"
        >
          <MultipleRecordPicker
            componentInstanceId={componentInstanceId}
            onCreate={async () => undefined}
          />
        </DropdownContent>
      </DropdownRoot>
      <Button variant="ghost">Outside picker</Button>
    </div>
  </div>
);
