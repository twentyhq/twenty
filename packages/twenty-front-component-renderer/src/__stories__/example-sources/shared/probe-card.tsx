import { type ReactNode } from 'react';

const CARD_STYLE = {
  padding: 20,
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: 12,
  fontFamily: 'system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
  maxWidth: 480,
};

const HEADING_STYLE = {
  color: '#111827',
  fontWeight: 700,
  fontSize: 16,
  margin: 0,
};

const SCENARIO_ID_STYLE = {
  fontSize: 11,
  color: '#6b7280',
  fontFamily: 'monospace',
};

const UNKNOWN_STYLE = {
  padding: 16,
  border: '2px dashed #f87171',
  borderRadius: 8,
  color: '#991b1b',
  fontFamily: 'monospace',
  fontSize: 13,
};

type ProbeCardProps = {
  scenarioId: string;
  children: ReactNode;
};

export const ProbeCard = ({ scenarioId, children }: ProbeCardProps) => (
  <div
    data-testid="probe-root"
    data-scenario-id={scenarioId}
    style={CARD_STYLE}
  >
    <h2 style={HEADING_STYLE}>{scenarioId}</h2>
    <span data-testid="probe-ready" style={SCENARIO_ID_STYLE}>
      ready
    </span>
    {children}
  </div>
);

type UnknownScenarioProps = {
  scenarioId: string;
};

export const UnknownScenario = ({ scenarioId }: UnknownScenarioProps) => (
  <div
    data-testid="probe-unknown-scenario"
    data-scenario-id={scenarioId}
    style={UNKNOWN_STYLE}
  >
    Unknown probe scenario: {scenarioId}
  </div>
);
