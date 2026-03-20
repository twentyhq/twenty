import { useCallback, useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

const POLL_INTERVAL_MS = 30_000; // check every 30s

export type HealthIssue = {
  level: 'error' | 'warning';
  message: string;
  detail?: string;
};

interface HealthResponse {
  status: string;
  twenty_ok: boolean;
  waha_ok: boolean;
  waha_failed_sessions: string[];
}

interface HealthStatus {
  issues: HealthIssue[];
}

export const useHealthStatus = (
  connected: boolean,
  activeSessionName: string | null,
) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [status, setStatus] = useState<HealthStatus>({ issues: [] });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    const issues: HealthIssue[] = [];

    // 1. WebSocket disconnected
    if (!connected) {
      issues.push({
        level: 'error',
        message: 'Disconnected from WhatsApp bridge',
        detail:
          'Real-time updates are paused. The page will reconnect automatically.',
      });
    }

    // 2. Ping the bridge health endpoint
    try {
      const health = await bridgeFetch<HealthResponse>('/healthz');

      if (!health.twenty_ok) {
        issues.push({
          level: 'error',
          message: 'CRM database is unreachable',
          detail:
            'Messages and conversations may not load correctly. Contact your admin.',
        });
      }

      if (!health.waha_ok) {
        issues.push({
          level: 'error',
          message: 'WhatsApp service is unreachable',
          detail:
            'Messages cannot be sent or received. Contact your admin.',
        });
      }

      // Check if the user's active session is failed
      if (
        activeSessionName &&
        health.waha_failed_sessions?.includes(activeSessionName)
      ) {
        issues.push({
          level: 'error',
          message: `WhatsApp session "${activeSessionName}" is down`,
          detail:
            'Messages on this session cannot be sent or received. The session needs to be restarted.',
        });
      }
    } catch {
      // If health endpoint itself fails, bridge is down
      if (connected) {
        issues.push({
          level: 'error',
          message: 'WhatsApp bridge is unreachable',
          detail:
            'Messages cannot be sent or received. Contact your admin if this persists.',
        });
      }
    }

    setStatus({ issues });
  }, [bridgeFetch, connected, activeSessionName]);

  useEffect(() => {
    check();
    timerRef.current = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [check]);

  return status;
};
