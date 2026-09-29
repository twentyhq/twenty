import { Param } from '@nestjs/common';

import { type ApplicationTargetKind } from 'src/engine/core-modules/application/types/application-target.type';
import { attachApplicationTarget } from 'src/engine/core-modules/application/utils/attach-application-target.util';

// REST counterpart of ApplicationTargetArg: replaces @Param
export const ApplicationTargetParam =
  (paramName: string, target: ApplicationTargetKind): ParameterDecorator =>
  (prototype, propertyKey, parameterIndex) => {
    attachApplicationTarget({
      prototype,
      propertyKey,
      target: { ...target, source: 'routeParam', argName: paramName },
    });

    Param(paramName)(prototype, propertyKey, parameterIndex);
  };
