import { Injectable } from '@nestjs/common';

import { type RemoteFileOriginResolver } from 'src/engine/core-modules/file/file-remote-content/types/remote-file-origin-resolver.type';
import { HandlerRegistry } from 'src/engine/utils/handler-registry';

@Injectable()
export class RemoteFileOriginResolverRegistryService extends HandlerRegistry<RemoteFileOriginResolver> {}
