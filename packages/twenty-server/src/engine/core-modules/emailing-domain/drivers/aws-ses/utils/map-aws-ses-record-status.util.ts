export const mapAwsSesRecordStatus = (
  sesStatus: string | undefined,
): string => {
  switch (sesStatus) {
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'pending';
  }
};
