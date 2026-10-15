import { type ApplicationReach } from 'src/engine/core-modules/authorization/application-reach/types/application-reach.type';
import { type ApplicationTargetAccess } from 'src/engine/core-modules/authorization/application-reach/types/application-target-access.type';
import { getReachableApplicationId } from 'src/engine/core-modules/authorization/application-reach/utils/get-reachable-application-id.util';

const WORKSPACE: ApplicationReach = { kind: 'workspace' };
const COMPOSER: ApplicationReach = {
  kind: 'composer',
  applicationId: 'composer-id',
};
const CONFINED: ApplicationReach = {
  kind: 'confined',
  applicationId: 'confined-id',
};

describe('getReachableApplicationId', () => {
  it.each<[ApplicationReach, ApplicationTargetAccess, string | undefined]>([
    [WORKSPACE, 'read', undefined],
    [WORKSPACE, 'trigger', undefined],
    [WORKSPACE, 'manage', undefined],
    [COMPOSER, 'read', undefined],
    [COMPOSER, 'trigger', undefined],
    [COMPOSER, 'manage', 'composer-id'],
    [CONFINED, 'read', 'confined-id'],
    [CONFINED, 'trigger', 'confined-id'],
    [CONFINED, 'manage', 'confined-id'],
  ])('%o with %s access reaches %s', (reach, access, expected) => {
    expect(getReachableApplicationId({ reach, access })).toBe(expected);
  });
});
