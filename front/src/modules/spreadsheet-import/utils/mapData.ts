export const mapData = (data: string[][], valueMap: string[]) =>
  data.map((row) =>
    row.reduce<{ [k: string]: string }>((obj, value, index) => {
      if (valueMap[index]) {
        obj[valueMap[index]] = `${value}`;
        return obj;
      }
      return obj;
    }, {}),
  );
