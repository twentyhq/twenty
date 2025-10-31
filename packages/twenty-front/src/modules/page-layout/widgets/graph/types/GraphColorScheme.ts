export type GraphColorScheme = {
  name: string;
  gradient: {
    normal: [string, string];
    hover: [string, string];
  };
  solid: string;
  variations: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
};
