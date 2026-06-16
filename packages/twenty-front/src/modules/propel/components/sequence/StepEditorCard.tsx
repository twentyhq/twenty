import {
  ActionIcon,
  Badge,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowsSplit2,
  IconArrowUp,
  IconClock,
  IconFlag,
  IconMail,
  IconMessage,
  IconPhone,
  IconTrash,
} from 'twenty-ui/display';
import {
  type ConditionKind,
  type SequenceStepDraft,
  type StepType,
  type WaTemplateOption,
} from '@/propel/types/sequenceEditor';
import {
  CONDITION_OPTIONS,
  STEP_TYPE_LABEL,
  STEP_TYPE_OPTIONS,
  blankStep,
  clampInt,
  flowStepTitle,
} from '@/propel/lib/sequenceEditorConfig';

// One step's full editor — the dense form the front-component sandbox handled with
// raw native <select>/<textarea> and hand-rolled pills. Here it's real Mantine
// Select/NumberInput/Textarea (proper focus + keyboard the box forbade). Branch
// targets stay the index wire-format the save route resolves to sibling ids.

const STEP_ICON: Record<StepType, React.ReactNode> = {
  SEND_EMAIL: <IconMail size={15} />,
  SEND_WHATSAPP: <IconMessage size={15} />,
  WAIT: <IconClock size={15} />,
  CONDITION: <IconArrowsSplit2 size={15} />,
  CREATE_TASK: <IconPhone size={15} />,
  EXIT: <IconFlag size={15} />,
};

export const StepEditorCard = ({
  step,
  index,
  total,
  editable,
  selected,
  waOptions,
  branchOptions,
  onSelect,
  onPatch,
  onReplaceType,
  onMove,
  onRemove,
}: {
  step: SequenceStepDraft;
  index: number;
  total: number;
  editable: boolean;
  selected: boolean;
  waOptions: WaTemplateOption[];
  branchOptions: { value: string; label: string; disabled?: boolean }[];
  onSelect: () => void;
  onPatch: (patch: Partial<SequenceStepDraft>) => void;
  onReplaceType: (next: StepType) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) => {
  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        background: 'var(--mantine-color-body)',
        borderColor: selected
          ? 'var(--mantine-color-red-6)'
          : 'var(--mantine-color-default-border)',
        boxShadow: selected ? '0 0 0 2px var(--mantine-color-red-light)' : undefined,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Badge
              size="sm"
              variant="light"
              color="gray"
              leftSection={STEP_ICON[step.stepType]}
              circle={false}
            >
              {index + 1}
            </Badge>
            <Select
              size="xs"
              w={228}
              disabled={!editable}
              value={step.stepType}
              data={STEP_TYPE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              onChange={(value) => {
                if (value) onReplaceType(value as StepType);
              }}
              comboboxProps={{ withinPortal: true }}
              allowDeselect={false}
            />
          </Group>
          {editable ? (
            <Group gap={4} wrap="nowrap">
              <ActionIcon
                size="sm"
                variant="default"
                aria-label="Move up"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(-1);
                }}
              >
                <IconArrowUp size={14} />
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="default"
                aria-label="Move down"
                disabled={index === total - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(1);
                }}
              >
                <IconArrowDown size={14} />
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="default"
                color="red"
                aria-label="Remove step"
                disabled={total === 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ) : (
            <Badge size="xs" variant="light" color="gray">
              {STEP_TYPE_LABEL[step.stepType]}
            </Badge>
          )}
        </Group>

        <TextInput
          size="xs"
          disabled={!editable}
          value={step.name}
          onChange={(e) => onPatch({ name: e.currentTarget.value })}
          placeholder={`Step name (optional) — e.g. "Day-3 nudge"`}
          onClick={(e) => e.stopPropagation()}
        />

        {step.stepType === 'SEND_EMAIL' ? (
          <>
            <TextInput
              size="xs"
              disabled={!editable}
              value={step.templateSubject ?? ''}
              onChange={(e) =>
                onPatch({ templateSubject: e.currentTarget.value })
              }
              placeholder="Email subject"
              onClick={(e) => e.stopPropagation()}
            />
            <Textarea
              size="xs"
              autosize
              minRows={3}
              maxRows={8}
              disabled={!editable}
              value={step.templateBody ?? ''}
              onChange={(e) => onPatch({ templateBody: e.currentTarget.value })}
              placeholder="Email body — {{firstName}} personalises it"
              onClick={(e) => e.stopPropagation()}
            />
          </>
        ) : null}

        {step.stepType === 'SEND_WHATSAPP' ? (
          waOptions.length === 0 ? (
            <Text size="xs" c="yellow.7">
              No approved WhatsApp template available — create and approve one in
              Templates first.
            </Text>
          ) : (
            <Select
              size="xs"
              disabled={!editable}
              value={step.whatsappTemplateId ?? ''}
              placeholder="Pick a template…"
              data={waOptions.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.languageCode})`,
              }))}
              comboboxProps={{ withinPortal: true }}
              onChange={(value) => {
                const tpl = waOptions.find((t) => t.id === value);
                onPatch({
                  whatsappTemplateId: value || null,
                  whatsappLanguageCode: tpl?.languageCode ?? 'EN',
                  templateBody: tpl?.bodyText ?? null,
                });
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )
        ) : null}

        {step.stepType === 'WAIT' ? (
          <Group gap="xs" align="center" wrap="nowrap">
            <NumberInput
              size="xs"
              w={96}
              min={0}
              max={60}
              disabled={!editable}
              value={step.waitDays ?? 3}
              onChange={(value) =>
                onPatch({
                  waitDays: clampInt(
                    typeof value === 'number' ? value : parseInt(String(value), 10),
                    0,
                    60,
                  ),
                })
              }
              onClick={(e) => e.stopPropagation()}
            />
            <Text size="xs" c="dimmed">
              days before the next step
            </Text>
          </Group>
        ) : null}

        {step.stepType === 'CONDITION' ? (
          <Stack gap="xs">
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                If they…
              </Text>
              <Group gap={6}>
                {CONDITION_OPTIONS.map((o) => {
                  const on = (step.conditionKind ?? 'OPENED') === o.value;
                  return (
                    <Badge
                      key={o.value}
                      size="md"
                      radius="xl"
                      variant={on ? 'filled' : 'outline'}
                      color={on ? 'red' : 'gray'}
                      style={{
                        cursor: editable ? 'pointer' : 'default',
                        textTransform: 'none',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editable)
                          onPatch({ conditionKind: o.value as ConditionKind });
                      }}
                    >
                      {o.pill}
                    </Badge>
                  );
                })}
              </Group>
            </div>
            <Group gap="sm" grow align="flex-start">
              <div>
                <Text size="xs" c="teal.7" fw={600} mb={4}>
                  If they did → jump to
                </Text>
                <Select
                  size="xs"
                  disabled={!editable}
                  value={
                    step.yesStepIndex == null ? '' : String(step.yesStepIndex)
                  }
                  data={branchOptions}
                  comboboxProps={{ withinPortal: true }}
                  onChange={(value) =>
                    onPatch({
                      yesStepIndex: value === '' || value == null ? null : Number(value),
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={600} mb={4}>
                  Otherwise → jump to
                </Text>
                <Select
                  size="xs"
                  disabled={!editable}
                  value={
                    step.noStepIndex == null ? '' : String(step.noStepIndex)
                  }
                  data={branchOptions}
                  comboboxProps={{ withinPortal: true }}
                  onChange={(value) =>
                    onPatch({
                      noStepIndex: value === '' || value == null ? null : Number(value),
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </Group>
          </Stack>
        ) : null}

        {step.stepType === 'CREATE_TASK' ? (
          <Text size="xs" c="dimmed">
            Creates a call task for the person&rsquo;s agent and ends their journey
            here.
          </Text>
        ) : null}
        {step.stepType === 'EXIT' ? (
          <Text size="xs" c="dimmed">
            Ends the sequence for the person.
          </Text>
        ) : null}

        {step.name.trim() === '' ? (
          <Text size="xs" c="dimmed" fs="italic">
            {flowStepTitle(step, index)}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
};
