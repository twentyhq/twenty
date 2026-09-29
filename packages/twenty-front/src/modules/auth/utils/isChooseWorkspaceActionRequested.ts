import { CHOOSE_WORKSPACE_ACTION } from '@/auth/sign-in-up/constants/ChooseWorkspaceAction';
import { SIGN_IN_UP_ACTION_SEARCH_PARAM } from '@/auth/sign-in-up/constants/SignInUpActionSearchParam';

export const isChooseWorkspaceActionRequested = () =>
  new URLSearchParams(window.location.search).get(
    SIGN_IN_UP_ACTION_SEARCH_PARAM,
  ) === CHOOSE_WORKSPACE_ACTION;
