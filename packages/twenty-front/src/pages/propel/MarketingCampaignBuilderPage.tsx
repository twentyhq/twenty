import { Button, Card, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAdjustments,
  IconArrowLeft,
  IconBroadcast,
  IconSparkles,
} from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { AiBuilderPanel } from '@/propel/components/campaign/AiBuilderPanel';
import { ManualWizard } from '@/propel/components/campaign/ManualWizard';
import { useCampaignBuilderData } from '@/propel/hooks/useCampaignBuilderData';
import { type AiPlan } from '@/propel/types/campaignBuilder';

type BuildMode = 'choose' | 'manual' | 'ai';

// The graduated Campaign / AI Builder (P3 hero #2). Rides Twenty's DefaultLayout
// (nav + top bar come from the router <Outlet/>); this page owns the header, the
// mode choice, and either the manual Mantine wizard or the conversational AI
// builder — all in its own Mantine scope. The whole point of graduating it is
// REAL modals/dropdowns/focus that the front-component sandbox forbade.
export const MarketingCampaignBuilderPage = () => {
  const navigate = useNavigate();
  const { isLoading, ...hub } = useCampaignBuilderData();
  const [mode, setMode] = useState<BuildMode>('choose');
  const [handoffPlan, setHandoffPlan] = useState<AiPlan | null>(null);

  const goHome = useCallback(() => {
    navigate(AppPath.MarketingHub);
  }, [navigate]);

  const handoffToManual = useCallback((plan: AiPlan) => {
    setHandoffPlan(plan);
    setMode('manual');
  }, []);

  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader title="New campaign" Icon={IconBroadcast}>
          <Button
            size="xs"
            variant="default"
            leftSection={<IconArrowLeft size={14} />}
            onClick={goHome}
          >
            Marketing
          </Button>
        </PageHeader>

        <div
          style={{
            padding: '8px 16px 24px',
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isLoading ? (
            <Center h={320}>
              <Loader color="red" />
            </Center>
          ) : mode === 'choose' ? (
            <ModeChoice
              onManual={() => {
                setHandoffPlan(null);
                setMode('manual');
              }}
              onAi={() => setMode('ai')}
            />
          ) : mode === 'manual' ? (
            <ManualWizard
              hub={hub}
              initialPlan={handoffPlan}
              onDone={goHome}
            />
          ) : (
            <Stack gap="md" style={{ flex: 1, minHeight: 0 }}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Describe what you want to send — every number is verified against
                  your real data before it&rsquo;s shown.
                </Text>
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => setMode('choose')}
                >
                  Back to start
                </Button>
              </Group>
              <AiBuilderPanel onHandoff={handoffToManual} />
            </Stack>
          )}
        </div>
      </PageContainer>
    </PropelMantineProvider>
  );
};

const ModeChoice = ({
  onManual,
  onAi,
}: {
  onManual: () => void;
  onAi: () => void;
}) => (
  <Center style={{ flex: 1, minHeight: 320 }}>
    <Stack gap="md" maw={520} w="100%">
      <Text size="sm" c="dimmed" ta="center">
        How do you want to build this campaign?
      </Text>
      <ChoiceCard
        icon={<IconAdjustments size={22} />}
        title="Build manually"
        description="Step through setup, copy, audience and review yourself."
        onClick={onManual}
      />
      <ChoiceCard
        icon={<IconSparkles size={22} />}
        accent
        title="Build with AI"
        description="Describe it in a sentence — the AI proposes a full campaign with verified numbers."
        onClick={onAi}
      />
    </Stack>
  </Center>
);

const ChoiceCard = ({
  icon,
  title,
  description,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
  onClick: () => void;
}) => (
  <Card
    withBorder
    radius="md"
    padding="md"
    onClick={onClick}
    style={{
      cursor: 'pointer',
      background: 'var(--mantine-color-body)',
      borderColor: 'var(--mantine-color-default-border)',
    }}
  >
    <Group gap="md" wrap="nowrap">
      <Center
        style={{
          width: 44,
          height: 44,
          flex: 'none',
          borderRadius: 12,
          background: accent
            ? 'var(--mantine-color-red-light)'
            : 'var(--mantine-color-default-hover)',
          color: accent
            ? 'var(--mantine-color-red-6)'
            : 'var(--mantine-color-dimmed)',
        }}
      >
        {icon}
      </Center>
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text fw={700} size="sm" c="var(--mantine-color-text)">
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Group>
  </Card>
);
