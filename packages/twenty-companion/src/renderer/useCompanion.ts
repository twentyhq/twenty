import { i18n } from '@lingui/core';
import { useEffect, useState } from 'react';
import {
  type CompanionBridge,
  type CompanionCommand,
  type CompanionPage,
  type CompanionState,
} from '../shared/types';
import { createInitialState } from '../shared/create-initial-state';
import { previewState, previewCommand } from './preview';

declare global {
  interface Window {
    companion?: CompanionBridge;
  }
}
export const IS_PREVIEW =
  import.meta.env.DEV &&
  !window.companion &&
  new URLSearchParams(window.location.search).has('preview');

export const useCompanion = () => {
  const [state, setState] = useState(() =>
    IS_PREVIEW ? previewState(createInitialState()) : createInitialState(),
  );
  const [page, setPage] = useState<CompanionPage>('agenda');
  const [pending, setPending] = useState<
    Partial<Record<CompanionCommand['type'], number>>
  >({});
  const [loaded, setLoaded] = useState(!window.companion);
  useEffect(() => {
    const bridge = window.companion;
    if (!bridge) return;
    let receivedUpdate = false;
    let disposed = false;
    const acceptState = (value: CompanionState) => {
      if (disposed) return;
      setState(value);
      setLoaded(true);
    };
    const unsubscribe = bridge.onState((value) => {
      receivedUpdate = true;
      acceptState(value);
    });
    const unsubscribeNavigation = bridge.onNavigate(setPage);
    void bridge
      .getState()
      .then((value) => {
        if (!receivedUpdate) acceptState(value);
      })
      .catch(() => {
        if (!disposed) {
          setState((value) => ({
            ...value,
            error: {
              message: i18n._('Could not connect to the app. Reopen Twenty.'),
            },
          }));
          setLoaded(true);
        }
      });
    return () => {
      disposed = true;
      unsubscribe();
      unsubscribeNavigation();
    };
  }, []);
  const command = async (value: CompanionCommand) => {
    if (value.type === 'open-app' && !window.companion) {
      setPage(value.page ?? 'agenda');
      return;
    }
    setPending((previous) => ({
      ...previous,
      [value.type]: (previous[value.type] ?? 0) + 1,
    }));
    try {
      if (window.companion) await window.companion.command(value);
      else if (IS_PREVIEW) {
        setState((previous) => previewCommand(previous, value));
      }
    } catch {
      setState((previous) => ({
        ...previous,
        error: {
          message: i18n._(
            'The app could not complete this action. Please try again.',
          ),
        },
      }));
    } finally {
      setPending((previous) => ({
        ...previous,
        [value.type]: (previous[value.type] ?? 1) - 1,
      }));
    }
  };
  return {
    state,
    page,
    navigate: setPage,
    isPending: (...types: CompanionCommand['type'][]) =>
      types.some((type) => (pending[type] ?? 0) > 0),
    loaded,
    command,
  };
};
