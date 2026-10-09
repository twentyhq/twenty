import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { ApplicationVariableScope } from '~/generated-metadata/graphql';
import { useApplicationVariablesDraft } from '~/pages/settings/applications/hooks/useApplicationVariablesDraft';

const KEY = 'API_KEY';
const OTHER_KEY = 'REGION';
const OLD_VALUE = 'old';
const NEW_VALUE = 'new';
const LATER_VALUE = 'later';

const buildApplicationVariable = (key: string, value: string) => ({
  key,
  value,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const renderVariablesDraft = ({
  applicationId,
  scope = ApplicationVariableScope.WORKSPACE,
  applicationVariables = [buildApplicationVariable(KEY, OLD_VALUE)],
  updateApplicationVariable = jest.fn().mockResolvedValue(true),
}: {
  applicationId: string;
  scope?: ApplicationVariableScope;
  applicationVariables?: { key: string; value: string }[];
  updateApplicationVariable?: jest.Mock;
}) => {
  const refetchApplicationVariables = jest.fn().mockResolvedValue(undefined);

  const { result, rerender } = renderHook(
    ({ currentApplicationVariables }) =>
      useApplicationVariablesDraft({
        applicationId,
        scope,
        applicationVariables: currentApplicationVariables,
        updateApplicationVariable,
        refetchApplicationVariables,
      }),
    {
      wrapper,
      initialProps: { currentApplicationVariables: applicationVariables },
    },
  );

  return {
    result,
    rerender,
    updateApplicationVariable,
    refetchApplicationVariables,
  };
};

describe('useApplicationVariablesDraft', () => {
  it('has nothing to save before an edit', () => {
    const { result } = renderVariablesDraft({
      applicationId: 'app-untouched',
    });

    expect(result.current.hasUnsavedApplicationVariables).toBe(false);
    expect(result.current.draftApplicationVariables[0].value).toBe(OLD_VALUE);
  });

  it('keeps the edited value unsaved until it is saved', () => {
    const { result } = renderVariablesDraft({ applicationId: 'app-edited' });

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    expect(result.current.draftApplicationVariables[0].value).toBe(NEW_VALUE);
    expect(result.current.hasUnsavedApplicationVariables).toBe(true);
  });

  it('sends only the edited variables, then refetches once and drops the saved draft', async () => {
    const {
      result,
      rerender,
      updateApplicationVariable,
      refetchApplicationVariables,
    } = renderVariablesDraft({
      applicationId: 'app-saved',
      applicationVariables: [
        buildApplicationVariable(KEY, OLD_VALUE),
        buildApplicationVariable(OTHER_KEY, OLD_VALUE),
      ],
    });

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    await act(async () => {
      await result.current.saveApplicationVariables();
    });

    expect(updateApplicationVariable.mock.calls).toEqual([
      [{ key: KEY, value: NEW_VALUE }],
    ]);
    expect(refetchApplicationVariables).toHaveBeenCalledTimes(1);
    expect(
      refetchApplicationVariables.mock.invocationCallOrder[0],
    ).toBeGreaterThan(updateApplicationVariable.mock.invocationCallOrder[0]);

    rerender({
      currentApplicationVariables: [
        buildApplicationVariable(KEY, NEW_VALUE),
        buildApplicationVariable(OTHER_KEY, OLD_VALUE),
      ],
    });

    expect(result.current.hasUnsavedApplicationVariables).toBe(false);
    expect(result.current.draftApplicationVariables[0].value).toBe(NEW_VALUE);
  });

  it('keeps a value edited while the save is in flight', async () => {
    const { result } = renderVariablesDraft({
      applicationId: 'app-edited-during-save',
    });

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    await act(async () => {
      const savePromise = result.current.saveApplicationVariables();

      result.current.setApplicationVariableValue(KEY, LATER_VALUE);

      await savePromise;
    });

    expect(result.current.draftApplicationVariables[0].value).toBe(LATER_VALUE);
    expect(result.current.hasUnsavedApplicationVariables).toBe(true);
  });

  it('keeps the draft when the save fails', async () => {
    const { result, refetchApplicationVariables } = renderVariablesDraft({
      applicationId: 'app-save-failed',
      updateApplicationVariable: jest.fn().mockRejectedValue(new Error()),
    });

    act(() => {
      result.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    await act(async () => {
      await result.current.saveApplicationVariables();
    });

    expect(refetchApplicationVariables).not.toHaveBeenCalled();
    expect(result.current.draftApplicationVariables[0].value).toBe(NEW_VALUE);
    expect(result.current.isSavingApplicationVariables).toBe(false);
  });

  it('keeps the workspace and user drafts of an application apart', () => {
    const { result: workspaceDraft } = renderVariablesDraft({
      applicationId: 'app-both-scopes',
      scope: ApplicationVariableScope.WORKSPACE,
    });
    const { result: userDraft } = renderVariablesDraft({
      applicationId: 'app-both-scopes',
      scope: ApplicationVariableScope.USER,
    });

    act(() => {
      workspaceDraft.current.setApplicationVariableValue(KEY, NEW_VALUE);
    });

    expect(workspaceDraft.current.hasUnsavedApplicationVariables).toBe(true);
    expect(userDraft.current.hasUnsavedApplicationVariables).toBe(false);
    expect(userDraft.current.draftApplicationVariables[0].value).toBe(
      OLD_VALUE,
    );
  });
});
