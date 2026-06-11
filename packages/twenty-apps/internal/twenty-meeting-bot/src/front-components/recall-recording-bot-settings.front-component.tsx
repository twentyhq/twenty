import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useUserId } from 'twenty-sdk/front-component';

import { SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/settings-front-component-universal-identifier';

type WorkspaceMemberSettings = {
  id: string;
  meetingBotAutoRecordEnabled: boolean;
};

const RecallRecordingBotSettings = () => {
  const userId = useUserId();
  const [workspaceMember, setWorkspaceMember] =
    useState<WorkspaceMemberSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaceMember = useCallback(async () => {
    if (userId === null) {
      setLoading(false);
      setError('No current user');
      return;
    }

    try {
      setError(null);
      const client = new CoreApiClient();
      const queryResult = await client.query({
        workspaceMembers: {
          __args: {
            filter: { userId: { eq: userId } },
            first: 1,
          },
          edges: {
            node: {
              id: true,
              meetingBotAutoRecordEnabled: true,
            },
          },
        },
      });

      const workspaceMemberNode =
        queryResult.workspaceMembers?.edges?.[0]?.node;

      if (workspaceMemberNode === undefined) {
        setError('Workspace member not found');
        setWorkspaceMember(null);
      } else {
        setWorkspaceMember({
          id: workspaceMemberNode.id,
          meetingBotAutoRecordEnabled:
            workspaceMemberNode.meetingBotAutoRecordEnabled === true,
        });
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : String(fetchError),
      );
      setWorkspaceMember(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchWorkspaceMember();
  }, [fetchWorkspaceMember]);

  const handleToggle = useCallback(async () => {
    if (workspaceMember === null || saving) {
      return;
    }

    const nextEnabled = !workspaceMember.meetingBotAutoRecordEnabled;

    setSaving(true);
    setError(null);
    setWorkspaceMember({
      ...workspaceMember,
      meetingBotAutoRecordEnabled: nextEnabled,
    });

    try {
      const client = new CoreApiClient();
      // The generated WorkspaceMemberUpdateInput only models core fields, so
      // the app-owned field is passed through an untyped record.
      const data: Record<string, unknown> = {
        meetingBotAutoRecordEnabled: nextEnabled,
      };

      await client.mutation({
        updateWorkspaceMember: {
          __args: {
            id: workspaceMember.id,
            data,
          },
          id: true,
        },
      });
    } catch (mutationError) {
      setWorkspaceMember(workspaceMember);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : String(mutationError),
      );
    }
    setSaving(false);
  }, [workspaceMember, saving]);

  if (loading) {
    return (
      <div
        style={{
          padding: '16px',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#999',
        }}
      >
        Loading settings...
      </div>
    );
  }

  if (workspaceMember === null) {
    return (
      <div
        style={{
          padding: '16px',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#e05252',
        }}
      >
        {error ?? 'Unable to load settings'}
      </div>
    );
  }

  const isEnabled = workspaceMember.meetingBotAutoRecordEnabled;

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={handleToggle}
          disabled={saving}
          style={{
            width: '36px',
            height: '20px',
            borderRadius: '10px',
            border: 'none',
            padding: '2px',
            cursor: saving ? 'wait' : 'pointer',
            backgroundColor: isEnabled ? '#4caf50' : '#ccc',
            display: 'flex',
            justifyContent: isEnabled ? 'flex-end' : 'flex-start',
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#fff',
            }}
          />
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
          Auto-record my meetings
        </span>
      </div>
      <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 48px' }}>
        When enabled, the recording bot automatically joins your upcoming
        meetings that have a conference link. Individual calendar events can
        still be overridden with their Meeting Bot Preference field.
      </p>
      {error !== null && (
        <p
          style={{ fontSize: '12px', color: '#e05252', margin: '8px 0 0 48px' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'recall-recording-bot-settings',
  description:
    'Per-user settings tab with the auto-record toggle for the meeting bot.',
  component: RecallRecordingBotSettings,
});
