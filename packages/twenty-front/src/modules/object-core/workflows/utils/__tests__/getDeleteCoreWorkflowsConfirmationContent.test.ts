import { getDeleteCoreWorkflowsConfirmationContent } from '@/object-core/workflows/utils/getDeleteCoreWorkflowsConfirmationContent';

describe('getDeleteCoreWorkflowsConfirmationContent', () => {
  it('asks to delete a single workflow', () => {
    expect(getDeleteCoreWorkflowsConfirmationContent(1)).toEqual({
      title: 'Delete workflow?',
      subtitle:
        'This permanently deletes this workflow and all its run history. This action cannot be undone.',
      confirmButtonText: 'Delete workflow',
    });
  });

  it('counts the selected workflows', () => {
    expect(getDeleteCoreWorkflowsConfirmationContent(3)).toEqual({
      title: 'Delete 3 workflows?',
      subtitle:
        'This permanently deletes these 3 workflows and all their run history. This action cannot be undone.',
      confirmButtonText: 'Delete workflows',
    });
  });
});
