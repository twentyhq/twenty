import { type CanActivate, type Type } from '@nestjs/common';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { NestContainer } from '@nestjs/core/injector/container';
import { GraphInspector } from '@nestjs/core/inspector/graph-inspector';
import { DependenciesScanner } from '@nestjs/core/scanner';
import { RESOLVER_TYPE_METADATA } from '@nestjs/graphql/dist/graphql.constants.js';

import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import { AUTH_PRINCIPAL_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/auth-principal-guard-config-key.constant';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

type EndpointPermissionDeclarations = {
  authPrincipalGuards: AuthPrincipalGuardConfig[];
  applicationTarget: ApplicationTarget | null;
};

type EndpointClass = Type<object>;

type EndpointHandler = (...args: never[]) => unknown;

type ScannedClass = { endpointClass: EndpointClass; isController: boolean };

type Guard = Type<CanActivate> | CanActivate;

const GRAPHQL_OPERATION_TYPES = new Set(['Query', 'Mutation', 'Subscription']);

const reflector = new Reflector();
const metadataScanner = new MetadataScanner();

const scanClasses = async (
  rootModule: Type<object>,
): Promise<ScannedClass[]> => {
  const container = new NestContainer();

  await new DependenciesScanner(
    container,
    metadataScanner,
    new GraphInspector(container),
  ).scan(rootModule);

  const isControllerByClass = new Map<EndpointClass, boolean>();

  for (const moduleRef of container.getModules().values()) {
    for (const [wrappers, isController] of [
      [moduleRef.controllers, true],
      [moduleRef.providers, false],
    ] as const) {
      for (const { metatype } of wrappers.values()) {
        if (typeof metatype !== 'function' || !isDefined(metatype.prototype)) {
          continue;
        }

        const endpointClass = metatype as EndpointClass;

        isControllerByClass.set(
          endpointClass,
          isController || (isControllerByClass.get(endpointClass) ?? false),
        );
      }
    }
  }

  return [...isControllerByClass.entries()].map(
    ([endpointClass, isController]) => ({ endpointClass, isController }),
  );
};

const isEndpointHandler = (
  handler: unknown,
  isController: boolean,
): handler is EndpointHandler =>
  typeof handler === 'function' &&
  (GRAPHQL_OPERATION_TYPES.has(
    Reflect.getMetadata(RESOLVER_TYPE_METADATA, handler),
  ) ||
    (isController && isDefined(reflector.get(PATH_METADATA, handler))));

const readAuthPrincipalGuardConfigs = (
  guardsOwner: EndpointClass | EndpointHandler,
): AuthPrincipalGuardConfig[] =>
  (reflector.get<Guard[] | undefined>(GUARDS_METADATA, guardsOwner) ?? [])
    .map((guard) =>
      reflector.get<AuthPrincipalGuardConfig | undefined>(
        AUTH_PRINCIPAL_GUARD_CONFIG_KEY,
        typeof guard === 'function' ? guard : guard.constructor,
      ),
    )
    .filter(isDefined);

const stringifyWithSortedKeys = (value: unknown): string =>
  JSON.stringify(value, (_key, nestedValue: unknown) =>
    isPlainObject(nestedValue)
      ? Object.fromEntries(
          Object.entries(nestedValue).sort(([left], [right]) =>
            left.localeCompare(right),
          ),
        )
      : nestedValue,
  );

export const collectEndpointPermissionDeclarations = async (
  rootModule: Type<object>,
): Promise<string[]> => {
  const declarationsByEndpoint = new Map<
    string,
    EndpointPermissionDeclarations
  >();

  for (const { endpointClass, isController } of await scanClasses(rootModule)) {
    const prototype = endpointClass.prototype;

    for (const methodName of metadataScanner.getAllMethodNames(prototype)) {
      const handler: unknown = prototype[methodName as keyof typeof prototype];

      if (!isEndpointHandler(handler, isController)) {
        continue;
      }

      const endpoint = `${endpointClass.name}.${methodName}`;

      if (declarationsByEndpoint.has(endpoint)) {
        throw new Error(
          `${endpoint} is declared by two different classes: rename one so the endpoint permission snapshot can tell them apart`,
        );
      }

      declarationsByEndpoint.set(endpoint, {
        authPrincipalGuards: [
          ...readAuthPrincipalGuardConfigs(endpointClass),
          ...readAuthPrincipalGuardConfigs(handler),
        ],
        applicationTarget:
          reflector.get<ApplicationTarget | undefined>(
            APPLICATION_TARGET_METADATA_KEY,
            handler,
          ) ?? null,
      });
    }
  }

  return [...declarationsByEndpoint.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([endpoint, declarations]) =>
        `${endpoint} ${stringifyWithSortedKeys(declarations)}`,
    );
};
