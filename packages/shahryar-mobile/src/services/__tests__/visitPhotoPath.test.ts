import assert from 'node:assert/strict';

import {
  buildPersistedVisitPhotoFileName,
  buildPersistedVisitPhotoUri,
  buildVisitPhotoDirectoryUri,
} from '../visitPhotoPath';

assert.equal(
  buildPersistedVisitPhotoFileName({
    capturedAt: '2026-06-01T09:10:11.123Z',
    sourceUri: 'file:///cache/camera/photo.jpeg?tmp=true',
  }),
  'visit-2026-06-01T09-10-11-123Z.jpeg',
);

assert.equal(
  buildPersistedVisitPhotoFileName({
    capturedAt: '2026-06-01T09:10:11.123Z',
    sourceUri: 'file:///cache/camera/photo',
  }),
  'visit-2026-06-01T09-10-11-123Z.jpg',
);

assert.equal(
  buildVisitPhotoDirectoryUri({
    documentDirectoryUri: 'file:///data/user/app/files',
  }),
  'file:///data/user/app/files/shahryar-visit-photos/',
);

assert.equal(
  buildPersistedVisitPhotoUri({
    capturedAt: '2026-06-01T09:10:11.123Z',
    documentDirectoryUri: 'file:///data/user/app/files/',
    sourceUri: 'file:///cache/camera/photo.jpg',
  }),
  'file:///data/user/app/files/shahryar-visit-photos/visit-2026-06-01T09-10-11-123Z.jpg',
);

console.log('visitPhotoPath tests passed');
