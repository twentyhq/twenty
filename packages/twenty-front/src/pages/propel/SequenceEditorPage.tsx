import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconArrowLeft, IconArrowsSplit2 } from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { SequenceEditor } from '@/propel/components/sequence/SequenceEditor';
import { SequenceList } from '@/propel/components/sequence/SequenceList';
import { useSequenceEditorData } from '@/propel/hooks/useSequenceEditorData';
import { type SequenceRow } from '@/propel/types/sequenceEditor';

// The graduated Sequence Editor (P3 hero #4). Rides Twenty's DefaultLayout (nav +
// top bar come from the router <Outlet/>); this page owns the header and switches
// between the sequence LIST and the per-sequence EDITOR — all in its own Mantine
// scope. The whole reason it graduates out of the front-component sandbox is the
// React Flow node-graph canvas (the box has no DOM, so React Flow crashes there).
// Identity is server-derived from the session token by /marketing/* routes; this
// page never sends an acting-user id.

type View = { mode: 'list' } | { mode: 'edit'; sequence: SequenceRow | null };

export const SequenceEditorPage = () => {
  const navigate = useNavigate();
  const { sequences, segments, waTemplates, isLoading, loaded, reload } =
    useSequenceEditorData();
  const [view, setView] = useState<View>({ mode: 'list' });

  const goMarketing = useCallback(() => {
    navigate(AppPath.MarketingHub);
  }, [navigate]);

  const backToList = useCallback(() => {
    setView({ mode: 'list' });
    reload();
  }, [reload]);

  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader title="Sequences" Icon={IconArrowsSplit2}>
          <Button
            size="xs"
            variant="default"
            leftSection={<IconArrowLeft size={14} />}
            onClick={goMarketing}
          >
            Marketing
          </Button>
        </PageHeader>

        <div style={{ padding: '0 16px 24px', minHeight: 0 }}>
          {isLoading && !loaded ? (
            <Center h={320}>
              <Loader color="red" />
            </Center>
          ) : !loaded ? (
            <Center h={320}>
              <Stack gap="md" align="center">
                <Text size="sm" c="dimmed">
                  Couldn&rsquo;t load your sequences.
                </Text>
                <Button variant="default" onClick={reload}>
                  Retry
                </Button>
              </Stack>
            </Center>
          ) : view.mode === 'list' ? (
            <SequenceList
              sequences={sequences}
              onNew={() => setView({ mode: 'edit', sequence: null })}
              onEdit={(s) => setView({ mode: 'edit', sequence: s })}
              onMutated={reload}
            />
          ) : (
            <SequenceEditor
              initial={view.sequence}
              segments={segments}
              waTemplates={waTemplates}
              onBack={backToList}
              onSaved={backToList}
            />
          )}
        </div>
      </PageContainer>
    </PropelMantineProvider>
  );
};
