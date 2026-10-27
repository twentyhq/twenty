import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { IconMessageCircle, IconRefresh } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button, Select } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

const ENGINEER_COUNT = 19;
const SELECTED_ENGINEER_INDEX = 4;
const ENGINEER_OPTIONS = [
  { value: '', label: 'Pick your name' },
  ...Array.from({ length: ENGINEER_COUNT }, (_, engineerIndex) => ({
    value: `engineer-${engineerIndex + 1}`,
    label: `Engineer ${engineerIndex + 1}`,
  })),
];

const LongListSelectExample = () => {
  const [value, setValue] = useState(`engineer-${SELECTED_ENGINEER_INDEX + 1}`);
  const selectedEngineer = ENGINEER_OPTIONS.find(
    (engineer) => engineer.value === value,
  );

  return (
    <div
      data-testid="front-component-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'calc(100dvh - 56px)',
        minHeight: 0,
        boxSizing: 'border-box',
        padding: themeCssVariables.spacing[4],
        gap: themeCssVariables.spacing[4],
        overflowY: 'auto',
      }}
    >
      <div
        data-testid="front-component-mounted"
        style={{
          display: 'grid',
          gap: themeCssVariables.spacing[4],
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: themeCssVariables.spacing[2],
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: '1 1 160px',
              maxWidth: 240,
              minWidth: 0,
              gap: themeCssVariables.spacing[2],
            }}
          >
            <Avatar name={selectedEngineer?.label ?? 'Unknown'} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select.Root
                value={value}
                onValueChange={(nextValue) => setValue(nextValue ?? '')}
                items={ENGINEER_OPTIONS}
                modal={false}
              >
                <Select.Trigger aria-label="Engineer">
                  <Select.Value />
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Popup>
                      {ENGINEER_OPTIONS.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          <Select.ItemText>{option.label}</Select.ItemText>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: themeCssVariables.spacing[2],
            }}
          >
            <Button
              variant="outline"
              aria-label="Refresh projects"
              startIcon={<IconRefresh aria-hidden />}
            />
            <Button
              variant="solid"
              startIcon={<IconMessageCircle aria-hidden />}
            >
              Chat with PM
            </Button>
          </div>
        </div>
        <Text size="sm" color="secondary">
          Create or update projects and prepare your sync in one chat.
        </Text>
      </div>
      <Text role="status" aria-label="Engineer selection">
        Engineer: {value}
      </Text>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '9838371d-8013-4484-8f67-12401163c902',
  name: 'twenty-ui-select-long-list',
  description:
    'Controlled nonmodal Select with a long engineer list and default positioning',
  component: LongListSelectExample,
});
