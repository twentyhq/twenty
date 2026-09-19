import { t } from '@lingui/core/macro';
import { LightButton } from 'twenty-ui/components';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { TextInput } from '@/ui/input/components/TextInput';

type WorkflowClassifyCategoryProps = {
  index: number;
  category: { label: string; description: string };
  readonly?: boolean;
  onChange: (update: Partial<{ label: string; description: string }>) => void;
  onRemove: () => void;
};

export const WorkflowClassifyCategory = ({
  index,
  category,
  readonly,
  onChange,
  onRemove,
}: WorkflowClassifyCategoryProps) => (
  <>
    <TextInput
      label={t`Category ${index + 1}`}
      value={category.label}
      onChange={(label) => onChange({ label })}
      disabled={readonly}
      fullWidth
    />
    <TextInput
      label={t`Description`}
      value={category.description}
      onChange={(description) => onChange({ description })}
      disabled={readonly}
      fullWidth
    />
    {!readonly && (
      <LightButton
        onClick={onRemove}
      >{t`Remove category ${index + 1}`}</LightButton>
    )}
    <HorizontalSeparator noMargin />
  </>
);
