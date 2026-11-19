import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { isUserSessionVariantAccepted } from 'src/engine/guards/utils/is-user-session-variant-accepted.util';

type UserSessionGuardConfig = AuthPrincipalGuardConfig['userSession'];

const REFUSE_EVERY_VARIANT = {
  standard: false,
  impersonated: false,
  playground: false,
  workspaceAgnostic: false,
};

const ALL_USER_SESSION_VARIANTS = [
  'standard',
  'serverImpersonated',
  'workspaceImpersonated',
  'playground',
  'workspaceAgnostic',
] as const;

type UserSessionVariantName = (typeof ALL_USER_SESSION_VARIANTS)[number];

const CASES: {
  name: string;
  userSessionGuardConfig: UserSessionGuardConfig;
  acceptedVariants: UserSessionVariantName[];
}[] = [
  {
    name: 'true',
    userSessionGuardConfig: true,
    acceptedVariants: [...ALL_USER_SESSION_VARIANTS],
  },
  {
    name: 'false',
    userSessionGuardConfig: false,
    acceptedVariants: [],
  },
  {
    name: 'standard only',
    userSessionGuardConfig: { ...REFUSE_EVERY_VARIANT, standard: true },
    acceptedVariants: ['standard'],
  },
  {
    name: 'impersonated: true',
    userSessionGuardConfig: { ...REFUSE_EVERY_VARIANT, impersonated: true },
    acceptedVariants: ['serverImpersonated', 'workspaceImpersonated'],
  },
  {
    name: 'server-level impersonation only',
    userSessionGuardConfig: {
      ...REFUSE_EVERY_VARIANT,
      impersonated: { server: true, workspace: false },
    },
    acceptedVariants: ['serverImpersonated'],
  },
  {
    name: 'workspace-level impersonation only',
    userSessionGuardConfig: {
      ...REFUSE_EVERY_VARIANT,
      impersonated: { server: false, workspace: true },
    },
    acceptedVariants: ['workspaceImpersonated'],
  },
  {
    name: 'both impersonation levels refused',
    userSessionGuardConfig: {
      standard: true,
      impersonated: { server: false, workspace: false },
      playground: true,
      workspaceAgnostic: true,
    },
    acceptedVariants: ['standard', 'playground', 'workspaceAgnostic'],
  },
];

describe('isUserSessionVariantAccepted', () => {
  describe.each(CASES)(
    'with $name',
    ({ userSessionGuardConfig, acceptedVariants }) => {
      it.each(
        ALL_USER_SESSION_VARIANTS.map((userSessionVariant) => ({
          userSessionVariant,
          decision: acceptedVariants.includes(userSessionVariant)
            ? 'accept'
            : 'refuse',
        })),
      )(
        'should $decision $userSessionVariant',
        ({ userSessionVariant, decision }) => {
          expect(
            isUserSessionVariantAccepted({
              userSessionGuardConfig,
              userSessionVariant,
            }),
          ).toBe(decision === 'accept');
        },
      );
    },
  );
});
