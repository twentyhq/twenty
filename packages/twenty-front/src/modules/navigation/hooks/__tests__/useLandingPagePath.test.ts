import { renderHook } from '@testing-library/react';
import { AppPath } from 'twenty-shared/types';

import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useLandingPagePath } from '@/navigation/hooks/useLandingPagePath';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsMobile } from 'twenty-ui/utilities';

jest.mock('@/navigation/hooks/useDefaultHomePagePath');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
jest.mock('@/workspace/hooks/useIsFeatureEnabled');
jest.mock('twenty-ui/utilities', () => ({ useIsMobile: jest.fn() }));

const RECORD_HOME = '/objects/companies';

const setup = ({
  isChatFirstEnabled = true,
  hasAiPermission = true,
  aiModels = [{ modelId: 'chatgpt-plan/gpt-6.1-sol' }],
  isMobile = false,
  defaultHomePagePath = RECORD_HOME,
}: {
  isChatFirstEnabled?: boolean;
  hasAiPermission?: boolean;
  aiModels?: { modelId: string }[];
  isMobile?: boolean;
  defaultHomePagePath?: string;
} = {}) => {
  jest.mocked(useDefaultHomePagePath).mockReturnValue({ defaultHomePagePath });
  jest.mocked(useIsFeatureEnabled).mockReturnValue(isChatFirstEnabled);
  jest.mocked(useHasPermissionFlag).mockReturnValue(hasAiPermission);
  jest.mocked(useAtomStateValue).mockReturnValue(aiModels);
  jest.mocked(useIsMobile).mockReturnValue(isMobile);

  return renderHook(() => useLandingPagePath()).result.current.landingPagePath;
};

describe('useLandingPagePath', () => {
  it('lands on chat for an enabled workspace with a usable model', () => {
    expect(setup()).toBe('/chat');
  });

  it('keeps the record home when the flag is off', () => {
    expect(setup({ isChatFirstEnabled: false })).toBe(RECORD_HOME);
  });

  it('keeps the record home without AI permission or any model', () => {
    expect(setup({ hasAiPermission: false })).toBe(RECORD_HOME);
    expect(setup({ aiModels: [] })).toBe(RECORD_HOME);
  });

  it('keeps mobile navigation', () => {
    expect(setup({ isMobile: true })).toBe(RECORD_HOME);
  });

  it('waits while the record home is still loading', () => {
    expect(setup({ defaultHomePagePath: AppPath.Index })).toBe(AppPath.Index);
  });
});
