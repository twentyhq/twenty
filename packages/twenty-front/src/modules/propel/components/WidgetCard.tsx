import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { type ReactNode } from 'react';
import { type IconComponent, IconGripVertical } from 'twenty-ui/display';

// The shared shell every Marketing Home widget renders inside: a full-height
// Mantine Card whose header doubles as the react-grid-layout drag handle (the
// `.propel-drag-handle` class the grid's `draggableHandle` targets). The grip
// affordance only shows in edit mode; otherwise the header is a plain title bar.
export const WidgetCard = ({
  title,
  Icon,
  editMode,
  headerRight,
  children,
}: {
  title: string;
  Icon?: IconComponent;
  editMode: boolean;
  headerRight?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      h="100%"
      style={{
        background: 'var(--mantine-color-body)',
        borderColor: 'var(--mantine-color-default-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Card.Section
        className={editMode ? 'propel-drag-handle' : undefined}
        inheritPadding
        py="xs"
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          cursor: editMode ? 'grab' : 'default',
          userSelect: 'none',
          flex: '0 0 auto',
        }}
      >
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            {editMode && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label="Drag widget"
                style={{ cursor: 'grab' }}
              >
                <IconGripVertical size={14} />
              </ActionIcon>
            )}
            {Icon !== undefined && (
              <Icon size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
            )}
            <Text
              fw={600}
              size="sm"
              c="var(--mantine-color-text)"
              truncate
              title={title}
            >
              {title}
            </Text>
          </Group>
          {headerRight}
        </Group>
      </Card.Section>

      <div style={{ flex: '1 1 auto', minHeight: 0, paddingTop: 12 }}>
        {children}
      </div>
    </Card>
  );
};
