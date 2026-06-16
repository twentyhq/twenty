import { Badge, Button, Group, Text } from '@mantine/core';
import {
  type FormatAction,
  FORMAT_ACTIONS,
} from '@/propel/lib/campaignBuilderConfig';
import { type MergeField } from '@/propel/lib/campaignRenderer';
import { type CustomFieldOption } from '@/propel/types/campaignBuilder';

// The format toolbar + merge-field insert chips above the email body. In the
// real frontend focus()/setSelectionRange() work natively (the sandbox crashed
// on them), so caret-true insertion + re-selection Just Works — the payoff of
// graduating this surface.
export const ComposeToolbar = ({
  mergeFields,
  customFields,
  onFormat,
  onInsertToken,
}: {
  mergeFields: MergeField[];
  customFields: CustomFieldOption[];
  onFormat: (action: FormatAction) => void;
  onInsertToken: (field: string) => void;
}) => {
  return (
    <Group gap={6} wrap="wrap">
      {FORMAT_ACTIONS.map((action) => (
        <Button
          key={action.label}
          size="compact-xs"
          variant="default"
          title={action.title}
          onClick={() => onFormat(action)}
        >
          {action.label}
        </Button>
      ))}
      <Text size="xs" c="dimmed" ml={4} mr={2}>
        Insert:
      </Text>
      {mergeFields.map((field) => (
        <Badge
          key={field}
          variant="light"
          color="gray"
          size="sm"
          style={{ cursor: 'pointer', textTransform: 'none' }}
          onClick={() => onInsertToken(field)}
        >
          {`{{${field}}}`}
        </Badge>
      ))}
      {customFields.map((cf) => (
        <Badge
          key={cf.id}
          variant="light"
          color="red"
          size="sm"
          title={cf.label}
          style={{ cursor: 'pointer', textTransform: 'none' }}
          onClick={() => onInsertToken(cf.key)}
        >
          {`{{${cf.key}}}`}
        </Badge>
      ))}
    </Group>
  );
};
