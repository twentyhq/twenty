import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { IconRefresh, IconRocket } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Badge, H2Title, IconButton, Pill } from 'twenty-ui';

type FeatureId = number | `B${number}`;

type ImplementedFeature = {
  id: FeatureId;
  name: string;
  module: string;
  status: 'implemented' | 'pending-structure' | 'pending';
  isImperative: boolean;
  notes?: string;
};

type PendingModule = {
  module: string;
  title: string;
  pendingFeatureIds: FeatureId[];
  completionPhase: 'phase-2' | 'phase-3' | 'phase-4';
};

type FeatureExecutionRecord = {
  executionId: string;
  featureId: FeatureId;
  route: string;
  executedAt: string;
  payload: unknown;
  result: unknown;
};

type FeatureExecutionState = {
  featureId: FeatureId;
  latest: FeatureExecutionRecord | null;
  history: FeatureExecutionRecord[];
};

type FeatureStateMap = Record<string, FeatureExecutionState>;

type RunDescriptor = {
  endpoint: string;
  payload: Record<string, unknown>;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(5)};
`;

const SummaryValue = styled.div`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const SummaryLabel = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const SectionCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(5)};
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const FeatureRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const FeatureMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FeatureTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const FeatureSubTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const PendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
`;

const PendingCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SAMPLE_DEALS = [
  {
    id: 'deal-1',
    pipelineId: 'pipe-a',
    stage: 'NEW',
    amount: 12000,
    createdAt: new Date('2026-03-01').toISOString(),
    stageChangedAt: new Date('2026-03-20').toISOString(),
    status: 'OPEN' as const,
  },
  {
    id: 'deal-2',
    pipelineId: 'pipe-a',
    stage: 'PROPOSAL',
    amount: 50000,
    createdAt: new Date('2026-02-10').toISOString(),
    stageChangedAt: new Date('2026-03-15').toISOString(),
    status: 'OPEN' as const,
  },
  {
    id: 'deal-3',
    pipelineId: 'pipe-b',
    stage: 'WON',
    amount: 8000,
    createdAt: new Date('2026-01-20').toISOString(),
    stageChangedAt: new Date('2026-02-01').toISOString(),
    closedAt: new Date('2026-02-25').toISOString(),
    status: 'WON' as const,
  },
];

const RUN_BY_FEATURE_ID: Record<number, RunDescriptor> = {
  11: {
    endpoint: 'data-quality/analyze',
    payload: {
      records: [
        {
          id: 'rec-1',
          name: 'Acme Corp',
          email: 'ops@acme.com',
          company: 'Acme',
          updatedAt: new Date('2025-01-01').toISOString(),
        },
        {
          id: 'rec-2',
          name: 'Acme Corp',
          email: 'ops@acme.com',
          company: 'Acme',
          updatedAt: new Date('2026-03-20').toISOString(),
        },
      ],
      requiredFields: ['name', 'email', 'company'],
    },
  },
  23: {
    endpoint: 'email-sequences/simulate',
    payload: {
      sequenceId: 'seq-01',
      startDate: new Date().toISOString(),
      steps: [
        { id: 's1', delayDays: 0, subject: 'Intro', body: 'Hola {{name}}' },
        {
          id: 's2',
          delayDays: 2,
          subject: 'Follow up',
          body: 'Te comparto contexto.',
        },
      ],
      contacts: [
        {
          contactId: 'c-1',
          email: 'lead@example.com',
          replied: false,
          unsubscribed: false,
        },
      ],
    },
  },
  25: {
    endpoint: 'meeting-scheduler/slots',
    payload: {
      durationMinutes: 30,
      teamMembers: [
        {
          memberId: 'rep-1',
          memberName: 'Ana',
          load: 3,
          slots: [
            {
              startAt: new Date('2026-04-03T14:00:00.000Z').toISOString(),
              endAt: new Date('2026-04-03T15:00:00.000Z').toISOString(),
            },
          ],
        },
      ],
    },
  },
  33: {
    endpoint: 'pipeline/velocity',
    payload: {
      deals: SAMPLE_DEALS,
      stageOrder: ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'WON', 'LOST'],
    },
  },
  40: {
    endpoint: 'executive/scorecard',
    payload: {
      metrics: [
        { key: 'mrr', label: 'MRR', value: 85000, target: 100000 },
        { key: 'win_rate', label: 'Win Rate', value: 31, target: 35 },
        { key: 'churn', label: 'Churn', value: 4, warningThreshold: 3 },
      ],
    },
  },
  49: {
    endpoint: 'pipeline/multi-support',
    payload: {
      deals: SAMPLE_DEALS,
      pipelines: [
        {
          id: 'pipe-a',
          name: 'SMB Pipeline',
          stages: ['NEW', 'PROPOSAL', 'WON', 'LOST'],
        },
        {
          id: 'pipe-b',
          name: 'Enterprise Pipeline',
          stages: ['NEW', 'MEETING', 'NEGOTIATION', 'WON', 'LOST'],
        },
      ],
    },
  },
  50: {
    endpoint: 'pipeline/rotting',
    payload: {
      deals: SAMPLE_DEALS,
      thresholdByStage: { NEW: 5, PROPOSAL: 10 },
    },
  },
  59: {
    endpoint: 'customer-health/score',
    payload: {
      accounts: [
        {
          accountId: 'acc-1',
          accountName: 'Acme',
          productUsageScore: 90,
          supportLoadScore: 60,
          paymentBehaviorScore: 85,
          relationshipScore: 80,
        },
      ],
    },
  },
  61: {
    endpoint: 'surveys/plan',
    payload: {
      triggers: [
        {
          accountId: 'acc-1',
          eventType: 'ticket_closed',
          eventDate: new Date().toISOString(),
          preferredChannel: 'email',
        },
      ],
    },
  },
  62: {
    endpoint: 'renewals/plan',
    payload: {
      contracts: [
        {
          accountId: 'acc-1',
          contractId: 'ct-1',
          renewalDate: new Date('2026-08-01').toISOString(),
          ownerId: 'owner-1',
          mrr: 1200,
        },
      ],
    },
  },
  85: {
    endpoint: 'mcp/extension-points',
    payload: {
      objectNames: ['opportunity', 'account', 'contact'],
    },
  },
  94: {
    endpoint: 'rbac/field-evaluate',
    payload: {
      roleIds: ['sales-manager'],
      objectName: 'opportunity',
      fieldName: 'amount',
      action: 'read',
      permissions: [
        {
          roleId: 'sales-manager',
          objectName: 'opportunity',
          fieldName: 'amount',
          canRead: true,
          canUpdate: false,
        },
      ],
    },
  },
};

const formatDateTime = (isoDate?: string | null) => {
  if (!isoDate) {
    return 'Nunca';
  }

  return new Date(isoDate).toLocaleString('es-CO');
};

export const SettingsBI = () => {
  const { t } = useTranslation();
  const [implemented, setImplemented] = useState<ImplementedFeature[]>([]);
  const [pendingStructure, setPendingStructure] = useState<PendingModule[]>([]);
  const [states, setStates] = useState<FeatureStateMap>({});
  const [loading, setLoading] = useState(false);
  const [runningByFeature, setRunningByFeature] = useState<Record<string, boolean>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  const authFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const accessToken = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;

      if (!accessToken) {
        throw new Error('No auth token available');
      }

      const response = await fetch(`${REST_API_BASE_URL}/crm-acceleration/${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...(options?.headers ?? {}),
        },
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `HTTP ${response.status}`);
      }

      return response.json();
    },
    [],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [implementedResult, pendingResult, stateResult] = await Promise.all([
        authFetch('features/implemented'),
        authFetch('features/pending-structure'),
        authFetch('features/states'),
      ]);

      setImplemented(implementedResult as ImplementedFeature[]);
      setPendingStructure(pendingResult as PendingModule[]);
      setStates(stateResult as FeatureStateMap);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRunFeature = useCallback(
    async (featureId: FeatureId) => {
      if (typeof featureId !== 'number') {
        return;
      }

      const descriptor = RUN_BY_FEATURE_ID[featureId];

      if (!descriptor) {
        return;
      }

      setRunningByFeature((currentState) => ({
        ...currentState,
        [String(featureId)]: true,
      }));
      setError(null);

      try {
        await authFetch(descriptor.endpoint, {
          method: 'POST',
          body: JSON.stringify(descriptor.payload),
        });
        await loadData();
      } catch (runError) {
        setError(runError instanceof Error ? runError.message : 'Unknown error');
      } finally {
        setRunningByFeature((currentState) => ({
          ...currentState,
          [String(featureId)]: false,
        }));
      }
    },
    [authFetch, loadData],
  );

  const summary = useMemo(
    () => ({
      implemented: implemented.length,
      pendingModules: pendingStructure.length,
      totalPendingFeatures: pendingStructure.reduce(
        (accumulator, moduleItem) =>
          accumulator + moduleItem.pendingFeatureIds.length,
        0,
      ),
      executedFeatures: Object.values(states).filter((state) => state.latest).length,
    }),
    [implemented, pendingStructure, states],
  );

  return (
    <SubMenuTopBarContainer
      title={t('CRM Acceleration')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('BI Analytics') },
      ]}
    >
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('CRM Acceleration Console')} />
          <IconButton
            Icon={IconRefresh}
            variant="secondary"
            size="small"
            onClick={() => {
              void loadData();
            }}
          />
        </div>

        <SummaryGrid>
          <SummaryCard>
            <SummaryValue>{summary.implemented}</SummaryValue>
            <SummaryLabel>{t('Features implementadas')}</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{summary.executedFeatures}</SummaryValue>
            <SummaryLabel>{t('Features ejecutadas')}</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{summary.pendingModules}</SummaryValue>
            <SummaryLabel>{t('Modulos pendientes')}</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{summary.totalPendingFeatures}</SummaryValue>
            <SummaryLabel>{t('Features pendientes')}</SummaryLabel>
          </SummaryCard>
        </SummaryGrid>

        {error ? <Badge variant="danger">{error}</Badge> : null}
        {loading ? <Badge variant="gray">{t('Cargando...')}</Badge> : null}

        <SectionCard>
          <H2Title title={t('12 Features activas (persistidas)')} />
          <FeatureList>
            {implemented.map((feature) => {
              const state = states[String(feature.id)];
              const hasExecution = Boolean(state?.latest);

              return (
                <FeatureRow key={String(feature.id)}>
                  <FeatureMeta>
                    <FeatureTitle>
                      {`#${String(feature.id)} ${feature.name}`}
                    </FeatureTitle>
                    <FeatureSubTitle>
                      {`${feature.module} - ${feature.status}`}
                    </FeatureSubTitle>
                    <FeatureSubTitle>
                      {`Ultima ejecucion: ${formatDateTime(state?.latest?.executedAt)}`}
                    </FeatureSubTitle>
                  </FeatureMeta>
                  <ActionGroup>
                    <Pill label={hasExecution ? 'Persistido' : 'Sin ejecutar'} />
                    <IconButton
                      Icon={IconRocket}
                      variant="primary"
                      size="small"
                      disabled={runningByFeature[String(feature.id)]}
                      onClick={() => {
                        void handleRunFeature(feature.id);
                      }}
                    />
                  </ActionGroup>
                </FeatureRow>
              );
            })}
          </FeatureList>
        </SectionCard>

        <SectionCard>
          <H2Title title={t('Pendiente con estructura')} />
          <PendingGrid>
            {pendingStructure.map((moduleItem) => (
              <PendingCard key={moduleItem.module}>
                <FeatureTitle>{`${moduleItem.module} - ${moduleItem.title}`}</FeatureTitle>
                <FeatureSubTitle>{`Fase: ${moduleItem.completionPhase}`}</FeatureSubTitle>
                <FeatureSubTitle>
                  {`Features: ${moduleItem.pendingFeatureIds.map(String).join(', ')}`}
                </FeatureSubTitle>
              </PendingCard>
            ))}
          </PendingGrid>
        </SectionCard>
      </Container>
    </SubMenuTopBarContainer>
  );
};

