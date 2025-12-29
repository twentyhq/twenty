import { Test, type TestingModule } from '@nestjs/testing';

import { FieldActorSource } from 'twenty-shared/types';

import { ActivityQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/activity-query-result-getter.handler';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { type NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';

const baseNote = {
  id: '1',
  bodyV2: {
    markdown: null,
    blocknote: null,
  },
  position: 1,
  title: 'Test',
  createdBy: {
    name: 'Test',
    source: FieldActorSource.MANUAL,
    workspaceMemberId: '1',
    context: {},
  },
  updatedBy: {
    name: 'Test',
    source: FieldActorSource.MANUAL,
    workspaceMemberId: '1',
    context: {},
  },
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
  noteTargets: [],
  attachments: [],
  timelineActivities: [],
  favorites: [],
  searchVector: '',
  deletedAt: null,
} satisfies NoteWorkspaceEntity;

const baseTask = {
  ...baseNote,
  type: 'task',
};

describe('ActivityQueryResultGetterHandler', () => {
  let handler: ActivityQueryResultGetterHandler;

  beforeEach(async () => {
    process.env.SERVER_URL = 'https://my-domain.twenty.com';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityQueryResultGetterHandler,
        {
          provide: FileService,
          useValue: {
            signFileUrl: jest.fn().mockReturnValue('signed-path'),
          },
        },
      ],
    }).compile();

    handler = module.get<ActivityQueryResultGetterHandler>(
      ActivityQueryResultGetterHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.SERVER_URL;
  });

  describe('should do nothing', () => {
    it('when activity is a note and no image is found', async () => {
      const note = {
        ...baseNote,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([
            { type: 'paragraph', text: 'Hello, world!' },
          ]),
        },
      };

      const result = await handler.handle(note, '1');

      expect(result).toEqual(note);
    });

    it('when activity is a note and link is external', async () => {
      const note = {
        ...baseNote,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([
            {
              id: 'c6a5f700-5e56-480d-90a9-7f295216370e',
              type: 'image',
              props: {
                backgroundColor: 'default',
                textAlignment: 'left',
                name: '20240529_123208.jpg',
                url: 'http://external-content.com/image.jpg',
                caption: '',
                showPreview: true,
              },
              children: [],
            },
            {
              id: 'e2454736-51c1-4e61-a02d-71f0890bdda7',
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [],
              children: [],
            },
          ]),
        },
      };

      const result = await handler.handle(note, '1');

      expect(result).toEqual(note);
    });

    it('when activity is a task and no image is found', async () => {
      const task = {
        ...baseTask,
        bodyV2: {
          markdown: null,
          blocknote: null,
        },
      };

      const result = await handler.handle(task, '1');

      expect(result).toEqual(task);
    });
  });

  describe('should update token in file link', () => {
    it('when file link is in the body', async () => {
      const imageBlock = {
        id: 'c6a5f700-5e56-480d-90a9-7f295216370e',
        type: 'image',
        props: {
          backgroundColor: 'default',
          textAlignment: 'left',
          name: '20240529_123208.jpg',
          url: 'https://my-domain.twenty.com/files/attachment/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaWxlbmFtZSI6ImU0NWNiNDhhLTM2MmYtNGU4Zi1iOTEzLWM5MmI1ZTNlMGFhNi5qcGciLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsInN1YiI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsInR5cGUiOiJGSUxFIiwiaWF0IjoxNzUwNDI4NDQ1LCJleHAiOjE3NTA1MTQ4NDV9.qTN1b9IcmZvfVAqt1UlfJ_nn3GwIAEp7G9IoPtRJDxk/e45cb48a-362f-4e8f-b913-c92b5e3e0aa6.jpg',
          caption: '',
          showPreview: true,
        },
        children: [],
      };

      const note = {
        ...baseNote,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([imageBlock]),
        },
      };

      const result = await handler.handle(note, '1');

      expect(result).toEqual({
        ...note,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([
            {
              ...imageBlock,
              props: {
                ...imageBlock.props,
                url: 'https://my-domain.twenty.com/files/signed-path',
              },
            },
          ]),
        },
      });
    });
  });
});
