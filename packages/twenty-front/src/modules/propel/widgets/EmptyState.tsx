import { Center, Stack, Text } from '@mantine/core';
import { type IconComponent, IconInbox } from 'twenty-ui/display';

// Honest empty state — shown when a route reports a block as absent (presence
// contract: never zero-fill). Communicates "no data yet", not "zero".
export const EmptyState = ({
  message,
  Icon = IconInbox,
}: {
  message: string;
  Icon?: IconComponent;
}) => {
  return (
    <Center h="100%" mih={80}>
      <Stack align="center" gap={6}>
        <Icon size={22} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Text size="xs" c="dimmed" ta="center" maw={240}>
          {message}
        </Text>
      </Stack>
    </Center>
  );
};
