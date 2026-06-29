import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { assertAppDependencyInstallable } from 'src/engine/core-modules/application/application-install/utils/assert-app-dependency-installable.util';

const DEPENDENT = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const DEPENDENCY = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';

const baseParams = {
  dependentUniversalIdentifier: DEPENDENT,
  dependencyPackageName: 'kv-value-store',
  dependencyUniversalIdentifier: DEPENDENCY,
  resolvedVersion: '1.2.0',
  versionRange: '^1.0.0',
  installingUniversalIdentifiers: new Set<string>(),
};

describe('assertAppDependencyInstallable', () => {
  it('passes when the resolved version satisfies the range and there is no cycle', () => {
    expect(() => assertAppDependencyInstallable(baseParams)).not.toThrow();
  });

  it('throws APP_DEPENDENCY_VERSION_INCOMPATIBLE when the version does not satisfy the range', () => {
    expect.assertions(2);

    try {
      assertAppDependencyInstallable({
        ...baseParams,
        resolvedVersion: '2.0.0',
        versionRange: '^1.0.0',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect((error as ApplicationException).code).toBe(
        ApplicationExceptionCode.APP_DEPENDENCY_VERSION_INCOMPATIBLE,
      );
    }
  });

  it('throws APP_DEPENDENCY_CYCLE_DETECTED when the dependency is an ancestor being installed', () => {
    expect.assertions(2);

    try {
      assertAppDependencyInstallable({
        ...baseParams,
        installingUniversalIdentifiers: new Set([DEPENDENCY]),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect((error as ApplicationException).code).toBe(
        ApplicationExceptionCode.APP_DEPENDENCY_CYCLE_DETECTED,
      );
    }
  });

  it('throws APP_DEPENDENCY_CYCLE_DETECTED when an app depends on itself', () => {
    expect(() =>
      assertAppDependencyInstallable({
        ...baseParams,
        dependencyUniversalIdentifier: DEPENDENT,
      }),
    ).toThrow(ApplicationException);
  });

  it('checks the version before the cycle (incompatible self-dependency reports version error)', () => {
    expect.assertions(1);

    try {
      assertAppDependencyInstallable({
        ...baseParams,
        dependencyUniversalIdentifier: DEPENDENT,
        resolvedVersion: '2.0.0',
        versionRange: '^1.0.0',
      });
    } catch (error) {
      expect((error as ApplicationException).code).toBe(
        ApplicationExceptionCode.APP_DEPENDENCY_VERSION_INCOMPATIBLE,
      );
    }
  });
});
