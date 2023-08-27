export function objectArrayToCsv(
  arr: any[],
  mapping?: (key: string, value: any) => string,
) {
  const array = [Object.keys(arr[0]).filter((x) => x !== '__typename')].concat(
    arr,
  );

  return array
    .map((row) => {
      return Object.entries(row)
        .filter((x) => x[0] !== '__typename')
        .map(([key, value]) => {
          value = mapping ? mapping(key, value) : value;
          if (value == null || value === undefined) {
            value = '';
          }
          value = `"${String(value).replaceAll('"', '""')}"`;
          return value;
        })
        .join(',');
    })
    .join('\r\n');
}
