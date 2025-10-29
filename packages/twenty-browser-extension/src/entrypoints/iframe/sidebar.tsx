import styled from '@emotion/styled';

const StyledMain = styled.main`
    width: 20vw;
    height: 95vh;
    background: ${({theme}) => theme.background.primary};
    color: ${({theme}) => theme.color.gray};
    margin: 0;
    overflow: hidden;
`;
const Sidebar = () => {
    return <StyledMain>
        Hello
    </StyledMain>
}

export default Sidebar;
