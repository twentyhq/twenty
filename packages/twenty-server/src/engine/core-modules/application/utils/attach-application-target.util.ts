import { UseGuards } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

export const attachApplicationTarget = ({
  prototype,
  propertyKey,
  target,
}: {
  prototype: object;
  propertyKey: string | symbol | undefined;
  target: ApplicationTarget;
}): void => {
  const descriptor = isDefined(propertyKey)
    ? Object.getOwnPropertyDescriptor(prototype, propertyKey)
    : undefined;

  if (!isDefined(propertyKey) || typeof descriptor?.value !== 'function') {
    throw new Error(
      'An application target decorator must decorate a method parameter',
    );
  }

  // One owner to compare against per handler
  if (Reflect.hasMetadata(APPLICATION_TARGET_METADATA_KEY, descriptor.value)) {
    throw new Error(
      `${String(propertyKey)} declares more than one application target`,
    );
  }

  Reflect.defineMetadata(
    APPLICATION_TARGET_METADATA_KEY,
    target,
    descriptor.value,
  );

  UseGuards(ApplicationTargetGuard)(prototype, propertyKey, descriptor);
};
