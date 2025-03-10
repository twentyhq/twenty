/* eslint-disable @nx/workspace-no-hardcoded-colors */
import styled from '@emotion/styled';

const StyledKeyboard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  justify-items: center;
`;

const StyledKey = styled.div`
  border-radius: 50%;
  border: 2px solid #fff;
  color: #000;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing(15)};
  height: ${({ theme }) => theme.spacing(15)};

  &:hover {
    background-color: ${({ theme }) => theme.background.overlayTertiary};
  }
`;

const Keyboard = ({ onClick }: { onClick: (key: string) => void }) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <StyledKeyboard>
      {keys.map((row) => (
        <>
          {row.map((key, j) => (
            <StyledKey
              key={j}
              className="keyboard-key"
              onClick={() => onClick(key)}
            >
              {key}
            </StyledKey>
          ))}
        </>
      ))}
    </StyledKeyboard>
  );
};

export default Keyboard;
