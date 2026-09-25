import { CHOOSE_WORKSPACE_ACTION } from '@/auth/sign-in-up/constants/ChooseWorkspaceAction';

export const isChooseWorkspaceActionRequested = () =>
  new URLSearchParams(window.location.search).get('action') ===
  CHOOSE_WORKSPACE_ACTION;
